from drf_spectacular.utils import OpenApiExample, extend_schema
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q

from.service import ask_ai
from.serializers import AIChatRequestSerializer, AIChatResponseSerializer
from apps.products.models import Product

class AIChatView(APIView):
    permission_classes = [AllowAny]
    serializer_class = AIChatRequestSerializer

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

        try:
            # SMART SEARCH: Find products related to user question
            # e.g. user says "mobile" -> we find mobiles only, not shoes
            words = message.lower().split()
            # filter out common words
            stop_words = {'best', 'under', 'for', 'show', 'me', 'give', 'a', 'the', 'is', 'are'}
            keywords = [w for w in words if w not in stop_words][:4]

            q_filter = Q()
            for kw in keywords:
                q_filter |= Q(name__icontains=kw) | Q(category__icontains=kw) | Q(brand__icontains=kw)

            products = Product.objects.filter(q_filter).values('name', 'price', 'brand', 'category')[:8]

            if not products:
                # fallback: get latest 8 products if no match
                products = Product.objects.values('name', 'price', 'brand', 'category')[:8]

            # Clean context for AI
            context_lines = []
            for p in products:
                context_lines.append(
                    f"- {p['name']} | Brand: {p['brand']} | Category: {p['category']} | Price: Rs. {p['price']}"
                )
            products_context = "\n".join(context_lines)

            ai_answer = ask_ai(message, products_context)

            return Response({"success": True, "message": ai_answer})

        except Exception as e:
            print("AI VIEW ERROR:", e)
            return Response(
                {"success": False, "message": "AI service is temporarily unavailable."},
                status=500
            )