from drf_spectacular.utils import OpenApiExample, extend_schema
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.throttling import AnonRateThrottle
from django.db.models import Q
from django.core.cache import cache

from.service import ask_ai
from.serializers import AIChatRequestSerializer, AIChatResponseSerializer
from apps.products.models import Product

class AIChatRateThrottle(AnonRateThrottle):
    rate = '10/minute' # 1 user 1 min me sirf 10 AI request

class AIChatView(APIView):
    permission_classes = [AllowAny]
    serializer_class = AIChatRequestSerializer
    throttle_classes = [AIChatRateThrottle] # SECURITY 1

    @extend_schema(
        request=AIChatRequestSerializer,
        responses={200: AIChatResponseSerializer},
        examples=[
            OpenApiExample(
                "Chat Example",
                value={"message": "Best mobile under 20000 for gaming?"}
            )
        ],
        tags=["AI Assistant"]
    )
    def post(self, request):
        serializer = AIChatRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"success": False, "message": "Message is required."},
                status=400
            )

        message = serializer.validated_data['message'].strip()

        # SECURITY 2: Input limit
        if len(message) > 500:
            return Response(
                {"success": False, "message": "Message too long! Max 500 characters."},
                status=400
            )

        if len(message) < 3:
            return Response(
                {"success": False, "message": "Message too short!"},
                status=400
            )

        try:
            # SECURITY 3: Cache product context - har baar DB query nahi
            cache_key = f"ai_products_{message.lower()[:30]}"
            products_context = cache.get(cache_key)

            if not products_context:
                words = message.lower().split()
                stop_words = {'best', 'under', 'for', 'show', 'me', 'give', 'a', 'the', 'is', 'are', 'in', 'of', 'to'}
                keywords = [w for w in words if w not in stop_words and len(w) > 2][:4]

                q_filter = Q()
                for kw in keywords:
                    q_filter |= Q(name__icontains=kw) | Q(description__icontains=kw) | Q(category__name__icontains=kw) | Q(brand__name__icontains=kw)

                products = Product.objects.filter(q_filter).select_related('category', 'brand')[:8]

                if not products.exists():
                    products = Product.objects.select_related('category', 'brand').order_by('-created_at')[:8]

                context_lines = []
                for p in products:
                    cat_name = p.category.name if p.category and hasattr(p.category, 'name') else "N/A"
                    brand_name = p.brand.name if p.brand and hasattr(p.brand, 'name') else "N/A"
                    # Price safe
                    price = getattr(p, 'price', 'N/A')
                    context_lines.append(
                        f"- {p.name} | Brand: {brand_name} | Category: {cat_name} | Price: Rs. {price}"
                    )
                products_context = "\n".join(context_lines)
                cache.set(cache_key, products_context, 60 * 5) # 5 min cache

            ai_answer = ask_ai(message, products_context)

            return Response({"success": True, "message": ai_answer})

        except Exception as e:
            print("AI VIEW ERROR:", e)
            import traceback
            traceback.print_exc()
            # SECURITY 4: Error hide - internal error user ko mat dikhao
            return Response(
                {"success": False, "message": "AI service is temporarily unavailable. Please try again later."},
                status=500
            )