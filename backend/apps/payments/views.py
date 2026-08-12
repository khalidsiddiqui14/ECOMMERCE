from django.db import transaction
from django.shortcuts import get_object_or_404

from rest_framework import generics, status
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.orders.models import Order

from .models import Payment
from .serializers import PaymentSerializer


class PaymentCreateView(generics.CreateAPIView):
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        order_id = request.data.get("order")
        payment_method = request.data.get(
            "payment_method",
            "COD",
        )

        if not order_id:
            raise ValidationError(
                {
                    "order": "Order ID is required."
                }
            )

        order = get_object_or_404(
            Order.objects.select_for_update(),
            id=order_id,
            user=request.user,
        )

        # Don't allow payment for cancelled orders.
        if order.status == "CANCELLED":
            raise ValidationError(
                "Payment cannot be created for a cancelled order."
            )

        # Don't create another payment for an already paid order.
        if order.payment_status == "PAID":
            raise ValidationError(
                "This order has already been paid."
            )

        # Only supported payment methods.
        allowed_methods = {
            "COD",
            "CARD",
            "UPI",
            "NETBANKING",
            "WALLET",
        }

        if payment_method not in allowed_methods:
            raise ValidationError(
                {
                    "payment_method": (
                        "Invalid payment method."
                    )
                }
            )

        payment, created = Payment.objects.get_or_create(
            order=order,
            defaults={
                "amount": order.total_amount,
                "payment_method": payment_method,
                "status": "PENDING",
            },
        )

        # If payment already exists, don't silently change
        # its amount or status.
        if not created:
            if payment.status == "SUCCESS":
                raise ValidationError(
                    "This order has already been paid."
                )

            if payment.payment_method != payment_method:
                payment.payment_method = payment_method
                payment.save(
                    update_fields=[
                        "payment_method",
                        "updated_at",
                    ]
                )

        serializer = self.get_serializer(
            payment
        )

        return Response(
            serializer.data,
            status=(
                status.HTTP_201_CREATED
                if created
                else status.HTTP_200_OK
            ),
        )


class PaymentDetailView(generics.RetrieveAPIView):
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            Payment.objects
            .select_related("order")
            .filter(
                order__user=self.request.user
            )
        )