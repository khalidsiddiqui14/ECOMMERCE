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

    # Get or create the authenticated user's cart
    def get_cart(self, user):
        cart, _ = Cart.objects.get_or_create(
            user=user,
        )

        return cart

    # Validate and normalize cart quantity
    def get_quantity(self, value, required=True):
        if value is None:
            if required:
                raise ValidationError(
                    {
                        "quantity": (
                            "Quantity is required."
                        )
                    }
                )

            return 1

        try:
            quantity = int(value)
        except (TypeError, ValueError):
            raise ValidationError(
                {
                    "quantity": (
                        "Quantity must be a valid integer."
                    )
                }
            )

        if quantity < 1:
            raise ValidationError(
                {
                    "quantity": (
                        "Quantity must be at least 1."
                    )
                }
            )

        return quantity

    # Validate that a product can be purchased
    def validate_product(self, product):
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
                        "This product is not available "
                        "for purchase."
                    )
                }
            )

        if product.stock <= 0:
            raise ValidationError(
                {
                    "product": (
                        "This product is currently "
                        "out of stock."
                    )
                }
            )

    # Return the authenticated user's cart
    def list(self, request):
        cart = (
            Cart.objects
            .prefetch_related(
                "items__product",
            )
            .get_or_create(
                user=request.user,
            )[0]
        )

        serializer = CartSerializer(
            cart,
            context={
                "request": request,
            },
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

    # Add a product to the authenticated user's cart
    @transaction.atomic
    def create(self, request):
        cart = self.get_cart(
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

        quantity = self.get_quantity(
            request.data.get("quantity", 1),
            required=False,
        )

        product = get_object_or_404(
            Product.objects.select_related(
                "store",
                "category",
                "brand",
            ),
            id=product_id,
        )

        self.validate_product(
            product,
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

        current_quantity = (
            item.quantity
            if item
            else 0
        )

        new_quantity = (
            current_quantity + quantity
        )

        if new_quantity > product.stock:
            raise ValidationError(
                {
                    "quantity": (
                        f"Only {product.stock} "
                        "item(s) are available "
                        "in stock."
                    )
                }
            )

        if item:
            item.quantity = new_quantity

            item.save(
                update_fields=[
                    "quantity",
                ],
            )
        else:
            CartItem.objects.create(
                cart=cart,
                product=product,
                quantity=quantity,
            )

        cart.refresh_from_db()

        cart = (
            Cart.objects
            .prefetch_related(
                "items__product",
            )
            .get(
                pk=cart.pk,
            )
        )

        serializer = CartSerializer(
            cart,
            context={
                "request": request,
            },
        )

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
        )

    # Update the quantity of a cart item
    @transaction.atomic
    def update(self, request, pk=None):
        cart = self.get_cart(
            request.user,
        )

        item = get_object_or_404(
            CartItem.objects
            .select_related(
                "product",
            )
            .select_for_update(),
            id=pk,
            cart=cart,
        )

        quantity = self.get_quantity(
            request.data.get("quantity"),
        )

        product = item.product

        self.validate_product(
            product,
        )

        if quantity > product.stock:
            raise ValidationError(
                {
                    "quantity": (
                        f"Only {product.stock} "
                        "item(s) are available "
                        "in stock."
                    )
                }
            )

        item.quantity = quantity

        item.save(
            update_fields=[
                "quantity",
            ],
        )

        cart = (
            Cart.objects
            .prefetch_related(
                "items__product",
            )
            .get(
                pk=cart.pk,
            )
        )

        serializer = CartSerializer(
            cart,
            context={
                "request": request,
            },
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

    # Remove a product from the authenticated user's cart
    @transaction.atomic
    def destroy(self, request, pk=None):
        cart = self.get_cart(
            request.user,
        )

        item = get_object_or_404(
            CartItem.objects.select_for_update(),
            id=pk,
            cart=cart,
        )

        item.delete()

        return Response(
            {
                "detail": (
                    "Item removed from cart."
                )
            },
            status=status.HTTP_200_OK,
        )