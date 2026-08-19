from django.db.models import Avg, Count
from django.shortcuts import get_object_or_404

from rest_framework import generics
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import (
    AllowAny,
    BasePermission,
    IsAuthenticated,
)
from rest_framework.response import Response

from apps.orders.models import Order, OrderItem
from apps.products.models import Product

from .models import Review
from .serializers import ReviewSerializer


class ReviewListCreateView(generics.ListCreateAPIView):
    serializer_class = ReviewSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAuthenticated()]

        return [AllowAny()]

    def get_queryset(self):
        product_id = self.request.query_params.get(
            "product"
        )

        queryset = (
            Review.objects
            .filter(is_active=True)
            .select_related(
                "user",
                "product",
            )
        )

        if product_id:
            queryset = queryset.filter(
                product_id=product_id
            )

        return queryset

    def perform_create(self, serializer):
        user = self.request.user

        product = serializer.validated_data["product"]

        # -------------------------------------------------
        # Product availability
        # -------------------------------------------------

        if not product.is_active:
            raise ValidationError(
                "You cannot review an inactive product."
            )

        # -------------------------------------------------
        # One review per user/product
        # -------------------------------------------------

        if Review.objects.filter(
            user=user,
            product=product,
        ).exists():
            raise ValidationError(
                "You have already reviewed this product."
            )

        # -------------------------------------------------
        # Verify delivered purchase
        # -------------------------------------------------

        has_purchased = OrderItem.objects.filter(
            order__user=user,
            order__status="DELIVERED",
            product=product,
        ).exists()

        if not has_purchased:
            raise ValidationError(
                "You can review a product only after "
                "purchasing and receiving it."
            )

        serializer.save(
            user=user,
            is_verified_purchase=True,
        )


class ReviewDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    serializer_class = ReviewSerializer

    def get_queryset(self):
        user = self.request.user

        queryset = Review.objects.select_related(
            "user",
            "product",
        )

        # Public users can only see active reviews.
        if not user.is_authenticated:
            return queryset.filter(
                is_active=True
            )

        # Admin can moderate all reviews.
        if getattr(user, "role", None) == "ADMIN":
            return queryset

        # Normal users can see active reviews.
        # Ownership is enforced separately for mutations.
        return queryset.filter(
            is_active=True
        )

    def perform_update(self, serializer):
        review = self.get_object()
        user = self.request.user

        if getattr(user, "role", None) == "ADMIN":
            serializer.save()
            return

        if review.user_id != user.id:
            raise PermissionDenied(
                "You can only update your own review."
            )

        serializer.save(
            user=user,
            is_verified_purchase=review.is_verified_purchase,
        )

    def perform_destroy(self, instance):
        user = self.request.user

        if getattr(user, "role", None) == "ADMIN":
            instance.delete()
            return

        if instance.user_id != user.id:
            raise PermissionDenied(
                "You can only delete your own review."
            )

        instance.delete()


class ProductRatingView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]

    def retrieve(self, request, *args, **kwargs):
        product = get_object_or_404(
            Product,
            id=kwargs["product_id"],
        )

        rating_data = product.reviews.filter(
            is_active=True,
        ).aggregate(
            average_rating=Avg("rating"),
            total_reviews=Count("id"),
        )

        average_rating = (
            rating_data["average_rating"]
            or 0
        )

        return Response(
            {
                "product": product.id,
                "product_name": product.name,
                "average_rating": round(
                    float(average_rating),
                    2,
                ),
                "total_reviews": (
                    rating_data["total_reviews"]
                    or 0
                ),
            }
        )