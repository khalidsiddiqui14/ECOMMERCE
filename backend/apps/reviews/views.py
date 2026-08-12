from django.db.models import Avg
from django.shortcuts import get_object_or_404

from rest_framework import generics
from rest_framework.permissions import IsAuthenticatedOrReadOnly

from apps.products.models import Product

from .models import Review
from .serializers import ReviewSerializer
from rest_framework.response import Response


class ReviewListCreateView(generics.ListCreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [
        IsAuthenticatedOrReadOnly
    ]

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
        serializer.save(
            user=self.request.user
        )


class ReviewDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    serializer_class = ReviewSerializer
    permission_classes = [
        IsAuthenticatedOrReadOnly
    ]

    def get_queryset(self):
        return Review.objects.filter(
            is_active=True
        )

    def perform_update(self, serializer):
        serializer.save(
            user=self.request.user
        )


class ProductRatingView(generics.RetrieveAPIView):
    permission_classes = [
        IsAuthenticatedOrReadOnly
    ]

    def retrieve(self, request, *args, **kwargs):
        product = get_object_or_404(
            Product,
            id=kwargs["product_id"],
        )

        rating_data = product.reviews.filter(
            is_active=True
        ).aggregate(
            average_rating=Avg("rating"),
        )

        return Response(
            {
                "product": product.id,
                "product_name": product.name,
                "average_rating": (
                    rating_data["average_rating"] or 0
                ),
                "total_reviews": product.reviews.filter(
                    is_active=True
                ).count(),
            }
        )