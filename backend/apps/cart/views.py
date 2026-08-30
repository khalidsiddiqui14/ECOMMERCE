from django.db import transaction
from django.shortcuts import get_object_or_404

from drf_spectacular.utils import (
    OpenApiParameter,
    OpenApiTypes,
    extend_schema,
)

from rest_framework import status, viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.products.models import Product

from .models import Cart, CartItem
from .serializers import CartSerializer


class CartViewSet(viewsets.ViewSet):
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]

    def get_cart(self, user):
        cart, _ = Cart.objects.get_or_create(
            user=user,
        )

        return cart

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

    def get_serialized_cart(self, cart, request):
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

        return serializer.data

    def list(self, request):
        cart = self.get_cart(
            request.user,
        )

        return Response(
            self.get_serialized_cart(
                cart,
                request,
            ),
            status=status.HTTP_200_OK,
        )

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
            request.data.get(
                "quantity",
                1,
            ),
            required=False,
        )

        product = get_object_or_404(
            Product.objects
            .select_for_update()
            .select_related(
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

        cart.save(
            update_fields=[
                "updated_at",
            ],
        )

        return Response(
            self.get_serialized_cart(
                cart,
                request,
            ),
            status=status.HTTP_201_CREATED,
        )

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name="id",
                type=OpenApiTypes.INT,
                location=OpenApiParameter.PATH,
                required=True,
            ),
        ],
    )
    @transaction.atomic
    def update(self, request, pk=None):
        cart = self.get_cart(
            request.user,
        )

        item = get_object_or_404(
            CartItem.objects
            .select_for_update()
            .select_related(
                "product",
            ),
            id=pk,
            cart=cart,
        )

        quantity = self.get_quantity(
            request.data.get("quantity"),
        )

        product = (
            Product.objects
            .select_for_update()
            .get(
                pk=item.product_id,
            )
        )

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

        cart.save(
            update_fields=[
                "updated_at",
            ],
        )

        return Response(
            self.get_serialized_cart(
                cart,
                request,
            ),
            status=status.HTTP_200_OK,
        )

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name="id",
                type=OpenApiTypes.INT,
                location=OpenApiParameter.PATH,
                required=True,
            ),
        ],
    )
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

        cart.save(
            update_fields=[
                "updated_at",
            ],
        )

        return Response(
            {
                "detail": (
                    "Item removed from cart."
                )
            },
            status=status.HTTP_200_OK,
        )