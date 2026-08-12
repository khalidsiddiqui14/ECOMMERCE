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

    http_method_names = [
        "get",
        "post",
        "patch",
        "head",
        "options",
    ]

    # ==========================================
    # Customer Orders
    # ==========================================

    def get_queryset(self):
        return (
            Order.objects
            .filter(user=self.request.user)
            .prefetch_related("items")
        )

    # ==========================================
    # Generate Order Number
    # ==========================================

    def generate_order_number(self):
        return f"ORD-{uuid.uuid4().hex[:12].upper()}"

    # ==========================================
    # Create Customer Order
    # ==========================================

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        cart = get_object_or_404(
            Cart.objects.select_for_update(),
            user=request.user,
        )

        cart_items = list(
            cart.items.select_related("product").all()
        )

        if not cart_items:
            raise ValidationError(
                "Your cart is empty."
            )

        serializer = self.get_serializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        subtotal = 0

        product_ids = [
            item.product_id
            for item in cart_items
        ]

        locked_products = {
            product.id: product
            for product in Product.objects
            .select_for_update()
            .filter(id__in=product_ids)
        }

        for cart_item in cart_items:
            product = locked_products.get(
                cart_item.product_id
            )

            if not product:
                raise ValidationError(
                    f"Product for cart item "
                    f"{cart_item.id} no longer exists."
                )

            if not product.is_active:
                raise ValidationError(
                    f"{product.name} is inactive."
                )

            if product.status != "PUBLISHED":
                raise ValidationError(
                    f"{product.name} is not available."
                )

            if cart_item.quantity > product.stock:
                raise ValidationError(
                    {
                        "stock": (
                            f"Only {product.stock} "
                            f"item(s) available for "
                            f"{product.name}."
                        )
                    }
                )

            subtotal += (
                product.price * cart_item.quantity
            )

        shipping_cost = 0

        total_amount = (
            subtotal + shipping_cost
        )

        order = Order.objects.create(
            user=request.user,
            order_number=self.generate_order_number(),
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
                ]
            )

        cart.items.all().delete()

        response_serializer = self.get_serializer(
            order
        )

        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED,
        )

    # ==========================================
    # Vendor Dashboard
    # ==========================================

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
                product__store__vendor__user=user
            )
            .select_related(
                "order",
                "product",
            )
        )

        total_products = (
            Product.objects
            .filter(
                store__vendor__user=user
            )
            .count()
        )

        total_orders = (
            vendor_items
            .values("order_id")
            .distinct()
            .count()
        )

        pending_orders = (
            vendor_items
            .filter(
                order__status="PENDING"
            )
            .values("order_id")
            .distinct()
            .count()
        )

        revenue = (
            vendor_items.aggregate(
                total=Sum("total_price")
            )["total"]
            or 0
        )

        recent_items = (
            vendor_items
            .order_by("-order__created_at")[:10]
        )

        recent_orders = {}

        for item in recent_items:
            order = item.order

            if order.id not in recent_orders:
                recent_orders[order.id] = {
                    "id": order.id,
                    "order_number": (
                        order.order_number
                    ),
                    "status": order.status,
                    "payment_status": (
                        order.payment_status
                    ),
                    "created_at": (
                        order.created_at
                    ),
                    "total_amount": "0.00",
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
                    "price": str(item.price),
                    "quantity": item.quantity,
                    "total_price": str(
                        item.total_price
                    ),
                }
            )

            current_total = sum(
                float(
                    order_item["total_price"]
                )
                for order_item in recent_orders[
                    order.id
                ]["items"]
            )

            recent_orders[
                order.id
            ]["total_amount"] = (
                f"{current_total:.2f}"
            )

        vendor = getattr(
            user,
            "vendor",
            None,
        )

        store = getattr(
            vendor,
            "store",
            None,
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
                    "total_products": total_products,
                    "total_orders": total_orders,
                    "pending_orders": pending_orders,
                    "revenue": str(revenue),
                },
                "recent_orders": list(
                    recent_orders.values()
                ),
            }
        )

    # ==========================================
    # Vendor Orders List
    # ==========================================

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
                product__store__vendor__user=user
            )
            .select_related(
                "order",
                "product",
            )
            .order_by(
                "-order__created_at"
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
                    "total": "0.00",
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
                    "price": str(item.price),
                    "total": str(
                        item.total_price
                    ),
                }
            )

            vendor_total = sum(
                float(
                    vendor_item["total"]
                )
                for vendor_item in orders[
                    order.id
                ]["items"]
            )

            orders[
                order.id
            ]["total"] = (
                f"{vendor_total:.2f}"
            )

        return Response(
            list(orders.values())
        )

    # ==========================================
    # Vendor Update Order Status
    # ==========================================

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
    def vendor_status(self, request, pk=None):
        user = request.user

        order = get_object_or_404(
            Order,
            id=pk,
        )

        # Make sure this order contains
        # at least one product belonging
        # to the current vendor.
        vendor_item_exists = (
            OrderItem.objects
            .filter(
                order=order,
                product__store__vendor__user=user,
            )
            .exists()
        )

        if not vendor_item_exists:
            return Response(
                {
                    "detail": (
                        "You do not have permission "
                        "to update this order."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        new_status = request.data.get(
            "status"
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
                    )
                }
            )

        if (
            order.status == "DELIVERED"
            and new_status != "DELIVERED"
        ):
            raise ValidationError(
                "A delivered order cannot be changed."
            )

        if (
            order.status == "CANCELLED"
            and new_status != "CANCELLED"
        ):
            raise ValidationError(
                "A cancelled order cannot be changed."
            )

        order.status = new_status

        order.save(
            update_fields=[
                "status",
                "updated_at",
            ]
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