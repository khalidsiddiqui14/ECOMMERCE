from django.db import transaction
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

    # Get or create the authenticated user's wishlist
    def get_wishlist(self, user):
        wishlist, _ = Wishlist.objects.get_or_create(
            user=user,
        )

        return wishlist

    # Return the authenticated user's wishlist
    def list(self, request):
        wishlist = (
            Wishlist.objects
            .prefetch_related(
                "items__product",
            )
            .get_or_create(
                user=request.user,
            )[0]
        )

        serializer = WishlistSerializer(
            wishlist,
            context={
                "request": request,
            },
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

    # Add a product to the authenticated user's wishlist
    @transaction.atomic
    def create(self, request):
        wishlist = self.get_wishlist(
            request.user,
        )

        product_id = request.data.get(
            "product",
        )

        if not product_id:
            raise ValidationError(
                {
                    "product": (
                        "Product ID is required."
                    )
                }
            )

        product = get_object_or_404(
            Product.objects.select_related(
                "store",
                "category",
                "brand",
            ),
            id=product_id,
        )

        if not product.is_active:
            raise ValidationError(
                {
                    "product": (
                        "This product is currently inactive."
                    )
                }
            )

        if product.status != "PUBLISHED":
            raise ValidationError(
                {
                    "product": (
                        "This product is not available."
                    )
                }
            )

        item, created = (
            WishlistItem.objects
            .select_for_update()
            .get_or_create(
                wishlist=wishlist,
                product=product,
            )
        )

        if not created:
            raise ValidationError(
                {
                    "product": (
                        "Product is already in "
                        "your wishlist."
                    )
                }
            )

        wishlist = (
            Wishlist.objects
            .prefetch_related(
                "items__product",
            )
            .get(
                pk=wishlist.pk,
            )
        )

        serializer = WishlistSerializer(
            wishlist,
            context={
                "request": request,
            },
        )

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
        )

    # Remove a product from the authenticated user's wishlist
    @transaction.atomic
    def destroy(self, request, pk=None):
        wishlist = self.get_wishlist(
            request.user,
        )

        item = get_object_or_404(
            WishlistItem.objects.select_for_update(),
            id=pk,
            wishlist=wishlist,
        )

        item.delete()

        return Response(
            {
                "detail": (
                    "Product removed from wishlist."
                )
            },
            status=status.HTTP_200_OK,
        )