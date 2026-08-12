from django.shortcuts import get_object_or_404

from rest_framework import status, viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.products.models import Product

from .models import Wishlist, WishlistItem
from .serializers import WishlistSerializer


class WishlistViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def get_wishlist(self, user):
        wishlist, _ = Wishlist.objects.get_or_create(
            user=user,
        )

        return wishlist

    def list(self, request):
        wishlist = self.get_wishlist(
            request.user
        )

        serializer = WishlistSerializer(
            wishlist
        )

        return Response(
            serializer.data
        )

    def create(self, request):
        wishlist = self.get_wishlist(
            request.user
        )

        product_id = request.data.get(
            "product"
        )

        if not product_id:
            raise ValidationError(
                {
                    "product":
                    "Product ID is required."
                }
            )

        product = get_object_or_404(
            Product,
            id=product_id,
        )

        if not product.is_active:
            raise ValidationError(
                "This product is currently inactive."
            )

        if product.status != "PUBLISHED":
            raise ValidationError(
                "This product is not available."
            )

        item, created = WishlistItem.objects.get_or_create(
            wishlist=wishlist,
            product=product,
        )

        if not created:
            raise ValidationError(
                "Product is already in your wishlist."
            )

        serializer = WishlistSerializer(
            wishlist
        )

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
        )

    def destroy(self, request, pk=None):
        wishlist = self.get_wishlist(
            request.user
        )

        item = get_object_or_404(
            WishlistItem,
            id=pk,
            wishlist=wishlist,
        )

        item.delete()

        return Response(
            {
                "detail":
                "Product removed from wishlist."
            },
            status=status.HTTP_200_OK,
        )