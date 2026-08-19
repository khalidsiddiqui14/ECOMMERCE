from decimal import Decimal
import uuid

from django.db import transaction
from django.db.models import Sum
from django.shortcuts import get_object_or_404

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.cart.models import Cart
from apps.core.permissions import IsVendor
from apps.products.models import Product

from .models import Order, OrderItem
from .serializers import OrderSerializer


class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    # Search
    search_fields = [
        "order_number",
        "shipping_name",
        "shipping_phone",
        "shipping_city",
    ]

    # Filtering
    filterset_fields = [
        "status",
        "payment_status",
    ]

    # Ordering
    ordering_fields = [
        "created_at",
        "total_amount",
        "status",
        "payment_status",
    ]

    ordering = [
        "-created_at",
    ]

    http_method_names = [
        "get",
        "post",
        "patch",
        "head",
        "options",
    ]

    def get_queryset(self):
        return (
            Order.objects
            .filter(
                user=self.request.user,
            )
            .prefetch_related(
                "items",
            )
            .order_by(
                "-created_at",
            )
        )

    def generate_order_number(self):
        return f"ORD-{uuid.uuid4().hex[:12].upper()}"

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        cart = get_object_or_404(
            Cart.objects.select_for_update(),
            user=request.user,
        )

        cart_items = list(
            cart.items
            .select_related(
                "product",
            )
            .all()
        )

        if not cart_items:
            raise ValidationError(
                {
                    "cart": "Your cart is empty.",
                }
            )

        serializer = self.get_serializer(
            data=request.data,
        )

        serializer.is_valid(
            raise_exception=True,
        )

        product_ids = [
            item.product_id
            for item in cart_items
        ]

        locked_products = {
            product.id: product
            for product in (
                Product.objects
                .select_for_update()
                .filter(
                    id__in=product_ids,
                )
            )
        }

        subtotal = Decimal("0.00")

        for cart_item in cart_items:
            product = locked_products.get(
                cart_item.product_id,
            )

            if not product:
                raise ValidationError(
                    {
                        "product": (
                            f"Product for cart item "
                            f"{cart_item.id} no longer exists."
                        ),
                    }
                )

            if not product.is_active:
                raise ValidationError(
                    {
                        "product": (
                            f"{product.name} is inactive."
                        ),
                    }
                )

            if product.status != "PUBLISHED":
                raise ValidationError(
                    {
                        "product": (
                            f"{product.name} is not "
                            "available for purchase."
                        ),
                    }
                )

            if product.stock < cart_item.quantity:
                raise ValidationError(
                    {
                        "stock": (
                            f"Only {product.stock} "
                            f"item(s) are available "
                            f"for {product.name}."
                        ),
                    }
                )

            subtotal += (
                product.price * cart_item.quantity
            )

        shipping_cost = Decimal("0.00")

        total_amount = (
            subtotal + shipping_cost
        )

        order = Order.objects.create(
            user=request.user,
            order_number=self.generate_order_number(),
            status="PENDING",
            payment_status="PENDING",
            subtotal=subtotal,
            shipping_cost=shipping_cost,
            total_amount=total_amount,
            shipping_name=serializer.validated_data[
                "shipping_name"
            ],
            shipping_phone=serializer.validated_data[
                "shipping_phone"
            ],
            shipping_address=serializer.validated_data[
                "shipping_address"
            ],
            shipping_city=serializer.validated_data[
                "shipping_city"
            ],
            shipping_state=serializer.validated_data[
                "shipping_state"
            ],
            shipping_country=serializer.validated_data[
                "shipping_country"
            ],
            shipping_postal_code=serializer.validated_data[
                "shipping_postal_code"
            ],
            notes=serializer.validated_data.get(
                "notes",
                "",
            ),
        )

        for cart_item in cart_items:
            product = locked_products[
                cart_item.product_id
            ]

            OrderItem.objects.create(
                order=order,
                product=product,
                product_name=product.name,
                sku=product.sku,
                price=product.price,
                quantity=cart_item.quantity,
            )

            product.stock -= cart_item.quantity

            if product.stock == 0:
                product.status = "OUT_OF_STOCK"

            product.save(
                update_fields=[
                    "stock",
                    "status",
                    "updated_at",
                ],
            )

        cart.items.all().delete()

        order = (
            Order.objects
            .prefetch_related(
                "items",
            )
            .get(
                pk=order.pk,
            )
        )

        response_serializer = self.get_serializer(
            order,
        )

        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED,
        )

    @action(
        detail=False,
        methods=["get"],
        url_path="vendor-dashboard",
        permission_classes=[
            IsAuthenticated,
            IsVendor,
        ],
    )
    def vendor_dashboard(self, request):
        user = request.user

        vendor_items = (
            OrderItem.objects
            .filter(
                product__store__vendor__user=user,
            )
            .select_related(
                "order",
                "product",
            )
        )

        total_products = (
            Product.objects
            .filter(
                store__vendor__user=user,
            )
            .count()
        )

        total_orders = (
            vendor_items
            .values(
                "order_id",
            )
            .distinct()
            .count()
        )

        pending_orders = (
            vendor_items
            .filter(
                order__status="PENDING",
            )
            .values(
                "order_id",
            )
            .distinct()
            .count()
        )

        revenue = (
            vendor_items.aggregate(
                total=Sum(
                    "total_price",
                ),
            )["total"]
            or Decimal("0.00")
        )

        recent_items = (
            vendor_items
            .order_by(
                "-order__created_at",
            )[:10]
        )

        recent_orders = {}

        for item in recent_items:
            order = item.order

            if order.id not in recent_orders:
                recent_orders[order.id] = {
                    "id": order.id,
                    "order_number": order.order_number,
                    "status": order.status,
                    "payment_status": (
                        order.payment_status
                    ),
                    "created_at": (
                        order.created_at
                    ),
                    "total_amount": (
                        Decimal("0.00")
                    ),
                    "items": [],
                }

            recent_orders[
                order.id
            ]["items"].append(
                {
                    "id": item.id,
                    "product_name": (
                        item.product_name
                    ),
                    "sku": item.sku,
                    "price": str(
                        item.price,
                    ),
                    "quantity": item.quantity,
                    "total_price": str(
                        item.total_price,
                    ),
                }
            )

            recent_orders[
                order.id
            ]["total_amount"] += (
                item.total_price
            )

        for order_data in recent_orders.values():
            order_data["total_amount"] = str(
                order_data["total_amount"]
            )

        vendor = getattr(
            user,
            "vendor",
            None,
        )

        store = (
            getattr(
                vendor,
                "store",
                None,
            )
            if vendor
            else None
        )

        return Response(
            {
                "store": {
                    "name": (
                        store.name
                        if store
                        else None
                    ),
                },
                "stats": {
                    "total_products": (
                        total_products
                    ),
                    "total_orders": (
                        total_orders
                    ),
                    "pending_orders": (
                        pending_orders
                    ),
                    "revenue": str(
                        revenue
                    ),
                },
                "recent_orders": list(
                    recent_orders.values()
                ),
            },
            status=status.HTTP_200_OK,
        )

    @action(
        detail=False,
        methods=["get"],
        url_path="vendor-orders",
        permission_classes=[
            IsAuthenticated,
            IsVendor,
        ],
    )
    def vendor_orders(self, request):
        user = request.user

        vendor_items = (
            OrderItem.objects
            .filter(
                product__store__vendor__user=user,
            )
            .select_related(
                "order",
                "product",
            )
            .order_by(
                "-order__created_at",
            )
        )

        orders = {}

        for item in vendor_items:
            order = item.order

            if order.id not in orders:
                orders[order.id] = {
                    "id": order.id,
                    "order_number": (
                        order.order_number
                    ),
                    "customer": (
                        order.shipping_name
                    ),
                    "phone": (
                        order.shipping_phone
                    ),
                    "address": (
                        order.shipping_address
                    ),
                    "city": (
                        order.shipping_city
                    ),
                    "state": (
                        order.shipping_state
                    ),
                    "country": (
                        order.shipping_country
                    ),
                    "postal_code": (
                        order.shipping_postal_code
                    ),
                    "status": order.status,
                    "payment_status": (
                        order.payment_status
                    ),
                    "date": (
                        order.created_at
                    ),
                    "total": (
                        Decimal("0.00")
                    ),
                    "items": [],
                }

            orders[
                order.id
            ]["items"].append(
                {
                    "id": item.id,
                    "product_id": (
                        item.product_id
                    ),
                    "product": (
                        item.product_name
                    ),
                    "sku": item.sku,
                    "quantity": item.quantity,
                    "price": str(
                        item.price,
                    ),
                    "total": str(
                        item.total_price,
                    ),
                }
            )

            orders[
                order.id
            ]["total"] += (
                item.total_price
            )

        for order_data in orders.values():
            order_data["total"] = str(
                order_data["total"]
            )

        orders = list(
            orders.values()
        )

        # Pagination for vendor orders
        page = self.paginate_queryset(
            orders
        )

        if page is not None:
            return self.get_paginated_response(
                page
            )

        return Response(
            orders,
            status=status.HTTP_200_OK,
        )

    @action(
        detail=True,
        methods=["patch"],
        url_path="vendor-status",
        permission_classes=[
            IsAuthenticated,
            IsVendor,
        ],
    )
    @transaction.atomic
    def vendor_status(
        self,
        request,
        pk=None,
    ):
        user = request.user

        order = get_object_or_404(
            Order.objects.select_for_update(),
            id=pk,
        )

        vendor_items = (
            OrderItem.objects
            .filter(
                order=order,
            )
            .select_related(
                "product__store__vendor",
            )
        )

        if not vendor_items.exists():
            raise ValidationError(
                {
                    "order": (
                        "Order does not contain any items."
                    ),
                }
            )

        vendor_item_count = (
            vendor_items
            .filter(
                product__store__vendor__user=user,
            )
            .count()
        )

        total_item_count = vendor_items.count()

        if (
            vendor_item_count != total_item_count
        ):
            return Response(
                {
                    "detail": (
                        "You cannot update the status "
                        "of a multi-vendor order."
                    ),
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        new_status = request.data.get(
            "status",
        )

        allowed_statuses = {
            "PENDING",
            "CONFIRMED",
            "PROCESSING",
            "SHIPPED",
            "DELIVERED",
            "CANCELLED",
        }

        if new_status not in allowed_statuses:
            raise ValidationError(
                {
                    "status": (
                        "Invalid order status."
                    ),
                }
            )

        current_status = order.status

        if current_status == "DELIVERED":
            raise ValidationError(
                "A delivered order cannot be changed."
            )

        if current_status == "CANCELLED":
            raise ValidationError(
                "A cancelled order cannot be changed."
            )

        allowed_transitions = {
            "PENDING": {
                "CONFIRMED",
                "CANCELLED",
            },
            "CONFIRMED": {
                "PROCESSING",
                "CANCELLED",
            },
            "PROCESSING": {
                "SHIPPED",
                "CANCELLED",
            },
            "SHIPPED": {
                "DELIVERED",
            },
        }

        if new_status != current_status:
            if new_status not in allowed_transitions.get(
                current_status,
                set(),
            ):
                raise ValidationError(
                    {
                        "status": (
                            f"Cannot change order status "
                            f"from {current_status} "
                            f"to {new_status}."
                        ),
                    }
                )

        order.status = new_status

        order.save(
            update_fields=[
                "status",
                "updated_at",
            ],
        )

        return Response(
            {
                "id": order.id,
                "order_number": (
                    order.order_number
                ),
                "status": order.status,
                "payment_status": (
                    order.payment_status
                ),
                "detail": (
                    "Order status updated successfully."
                ),
            },
            status=status.HTTP_200_OK,
        )