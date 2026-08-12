from django.db import transaction
from django.shortcuts import get_object_or_404

from rest_framework import status, viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.products.models import Product

from .models import Cart, CartItem
from .serializers import CartSerializer


class CartViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def get_cart(self, user):
        cart, _ = Cart.objects.get_or_create(
            user=user,
        )
        return cart

    def list(self, request):
        cart = self.get_cart(request.user)

        serializer = CartSerializer(
            cart,
            context={"request": request},
        )

        return Response(serializer.data)

    @transaction.atomic
    def create(self, request):
        cart = self.get_cart(request.user)

        product_id = request.data.get("product")
        quantity = request.data.get("quantity", 1)

        if not product_id:
            raise ValidationError(
                {"product": "Product ID is required."}
            )

        try:
            quantity = int(quantity)
        except (TypeError, ValueError):
            raise ValidationError(
                {"quantity": "Quantity must be a valid integer."}
            )

        if quantity < 1:
            raise ValidationError(
                {"quantity": "Quantity must be at least 1."}
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
                "This product is not available for purchase."
            )

        if product.stock < 1:
            raise ValidationError(
                "This product is out of stock."
            )

        item = (
            CartItem.objects
            .select_for_update()
            .filter(
                cart=cart,
                product=product,
            )
            .first()
        )

        current_quantity = item.quantity if item else 0
        new_quantity = current_quantity + quantity

        if new_quantity > product.stock:
            raise ValidationError(
                {
                    "quantity": (
                        f"Only {product.stock} item(s) "
                        "are available in stock."
                    )
                }
            )

        if item:
            item.quantity = new_quantity
            item.save(
                update_fields=["quantity"]
            )
        else:
            CartItem.objects.create(
                cart=cart,
                product=product,
                quantity=quantity,
            )

        serializer = CartSerializer(cart)

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
        )

    @transaction.atomic
    def update(self, request, pk=None):
        cart = self.get_cart(request.user)

        item = get_object_or_404(
            CartItem.objects.select_related("product"),
            id=pk,
            cart=cart,
        )

        quantity = request.data.get("quantity")

        if quantity is None:
            raise ValidationError(
                {"quantity": "Quantity is required."}
            )

        try:
            quantity = int(quantity)
        except (TypeError, ValueError):
            raise ValidationError(
                {"quantity": "Quantity must be a valid integer."}
            )

        if quantity < 1:
            raise ValidationError(
                {"quantity": "Quantity must be at least 1."}
            )

        product = item.product

        if not product.is_active:
            raise ValidationError(
                "This product is currently inactive."
            )

        if product.status != "PUBLISHED":
            raise ValidationError(
                "This product is not available for purchase."
            )

        if quantity > product.stock:
            raise ValidationError(
                {
                    "quantity": (
                        f"Only {product.stock} item(s) "
                        "are available in stock."
                    )
                }
            )

        item.quantity = quantity
        item.save(
            update_fields=["quantity"]
        )

        return Response(
            CartSerializer(cart).data,
            status=status.HTTP_200_OK,
        )

    @transaction.atomic
    def destroy(self, request, pk=None):
        cart = self.get_cart(request.user)

        item = get_object_or_404(
            CartItem,
            id=pk,
            cart=cart,
        )

        item.delete()

        return Response(
            {
                "detail": "Item removed from cart."
            },
            status=status.HTTP_200_OK,
        )