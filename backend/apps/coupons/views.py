from decimal import Decimal, InvalidOperation
from django.db import transaction
from django.shortcuts import get_object_or_404

from rest_framework import generics, status
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import AllowAny, BasePermission
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Coupon
from .serializers import CouponSerializer


class IsAdminUser(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == "ADMIN"
        )


class CouponListCreateView(
    generics.ListCreateAPIView
):
    serializer_class = CouponSerializer

    search_fields = [
        "code",
    ]

    filterset_fields = [
        "discount_type",
        "is_active",
    ]

    ordering_fields = [
        "code",
        "discount_value",
        "start_date",
        "end_date",
        "created_at",
    ]

    ordering = [
        "-created_at",
    ]

    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]

        return [IsAdminUser()]

    def get_queryset(self):
        return Coupon.objects.all()


class CouponDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    serializer_class = CouponSerializer
    permission_classes = [
        IsAdminUser
    ]

    queryset = Coupon.objects.all()


class CouponValidateView(
    generics.GenericAPIView
):
    serializer_class = CouponSerializer
    permission_classes = [
        AllowAny
    ]

    def post(self, request, *args, **kwargs):
        code = request.data.get("code")
        order_amount = request.data.get(
            "order_amount"
        )

        if not code:
            raise ValidationError(
                {
                    "code": "Coupon code is required."
                }
            )

        if order_amount is None:
            raise ValidationError(
                {
                    "order_amount": (
                        "Order amount is required."
                    )
                }
            )

        try:
            order_amount = Decimal(
                str(order_amount)
            )
        except (TypeError, ValueError, InvalidOperation):
            raise ValidationError(
                {
                    "order_amount": (
                        "Order amount must be "
                        "a valid number."
                    )
                }
            )

        if order_amount < Decimal("0.00"):
            raise ValidationError(
                {
                    "order_amount": (
                        "Order amount cannot "
                        "be negative."
                    )
                }
            )

        coupon = get_object_or_404(
            Coupon,
            code=code.strip().upper(),
        )

        if not coupon.is_active:
            raise ValidationError(
                "This coupon is currently inactive."
            )

        if not coupon.is_started:
            raise ValidationError(
                "This coupon is not active yet."
            )

        if coupon.is_expired:
            raise ValidationError(
                "This coupon has expired."
            )

        if coupon.is_usage_limit_reached:
            raise ValidationError(
                "This coupon usage limit has "
                "been reached."
            )

        discount = coupon.calculate_discount(
            order_amount
        )

        if discount <= Decimal("0.00"):
            raise ValidationError(
                {
                    "order_amount": (
                        "Minimum order amount for "
                        "this coupon has not "
                        "been reached."
                    )
                }
            )

        final_amount = (
            order_amount - discount
        )

        return Response(
            {
                "coupon": coupon.id,
                "code": coupon.code,
                "discount_type": (
                    coupon.discount_type
                ),
                "order_amount": (
                    f"{order_amount:.2f}"
                ),
                "discount_amount": (
                    f"{discount:.2f}"
                ),
                "final_amount": (
                    f"{final_amount:.2f}"
                ),
                "is_valid": True,
            },
            status=status.HTTP_200_OK,
        )


class CouponUseView(
    generics.GenericAPIView
):
    permission_classes = [
        IsAuthenticated
    ]

    @transaction.atomic
    def post(self, request, *args, **kwargs):
        if request.user.role not in (
            "ADMIN",
            "VENDOR",
        ):
            raise PermissionDenied(
                "You do not have permission "
                "to redeem coupons."
            )

        coupon_id = request.data.get(
            "coupon"
        )

        order_amount = request.data.get(
            "order_amount"
        )

        if not coupon_id:
            raise ValidationError(
                {
                    "coupon": (
                        "Coupon ID is required."
                    )
                }
            )

        if order_amount is None:
            raise ValidationError(
                {
                    "order_amount": (
                        "Order amount is required."
                    )
                }
            )

        try:
            order_amount = Decimal(
                str(order_amount)
            )
        except (TypeError, ValueError):
            raise ValidationError(
                {
                    "order_amount": (
                        "Order amount must be "
                        "a valid number."
                    )
                }
            )

        if order_amount < Decimal("0.00"):
            raise ValidationError(
                {
                    "order_amount": (
                        "Order amount cannot "
                        "be negative."
                    )
                }
            )

        coupon = (
            Coupon.objects
            .select_for_update()
            .filter(
                id=coupon_id,
            )
            .first()
        )

        if coupon is None:
            raise ValidationError(
                {
                    "coupon": (
                        "Coupon not found."
                    )
                }
            )

        if not coupon.is_valid:
            raise ValidationError(
                "This coupon is no longer valid."
            )

        discount = coupon.calculate_discount(
            order_amount
        )

        if discount <= Decimal("0.00"):
            raise ValidationError(
                "Coupon cannot be applied "
                "to this order."
            )

        coupon.used_count += 1

        coupon.save(
            update_fields=[
                "used_count",
                "updated_at",
            ]
        )

        final_amount = (
            order_amount - discount
        )

        return Response(
            {
                "coupon": coupon.id,
                "code": coupon.code,
                "discount_amount": (
                    f"{discount:.2f}"
                ),
                "final_amount": (
                    f"{final_amount:.2f}"
                ),
                "used_count": (
                    coupon.used_count
                ),
            },
            status=status.HTTP_200_OK,
        )