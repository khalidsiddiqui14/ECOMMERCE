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

        # Validate order ID.
        if not order_id:
            raise ValidationError(
                {
                    "order": "Order ID is required.",
                }
            )

        try:
            order_id = int(order_id)
        except (TypeError, ValueError):
            raise ValidationError(
                {
                    "order": (
                        "Order ID must be a valid integer."
                    ),
                }
            )

        if order_id < 1:
            raise ValidationError(
                {
                    "order": (
                        "Order ID must be a valid integer."
                    ),
                }
            )

        # Get the authenticated user's order.
        order = get_object_or_404(
            Order.objects.select_for_update(),
            id=order_id,
            user=request.user,
        )

        # Reject cancelled orders.
        if order.status == "CANCELLED":
            raise ValidationError(
                {
                    "order": (
                        "Payment cannot be created "
                        "for a cancelled order."
                    ),
                }
            )

        # Reject already paid orders.
        if order.payment_status == "PAID":
            raise ValidationError(
                {
                    "order": (
                        "This order has already been paid."
                    ),
                }
            )

        # Validate payment method.
        allowed_methods = {
            choice[0]
            for choice in Payment.METHOD_CHOICES
        }

        if payment_method not in allowed_methods:
            raise ValidationError(
                {
                    "payment_method": (
                        "Invalid payment method."
                    ),
                }
            )

        # Create or retrieve the order payment.
        payment, created = Payment.objects.get_or_create(
            order=order,
            defaults={
                "amount": order.total_amount,
                "payment_method": payment_method,
                "status": "PENDING",
            },
        )

        # Handle an existing payment.
        if not created:
            if payment.status == "SUCCESS":
                raise ValidationError(
                    {
                        "order": (
                            "This order has already been paid."
                        ),
                    }
                )

            if payment.status == "REFUNDED":
                raise ValidationError(
                    {
                        "order": (
                            "A refunded payment cannot "
                            "be reused."
                        ),
                    }
                )

            # Keep payment amount controlled by backend.
            if payment.amount != order.total_amount:
                payment.amount = order.total_amount

                payment.save(
                    update_fields=[
                        "amount",
                        "updated_at",
                    ],
                )

            # Allow method changes only for pending payments.
            if payment.status == "PENDING":
                if payment.payment_method != payment_method:
                    payment.payment_method = payment_method

                    payment.save(
                        update_fields=[
                            "payment_method",
                            "updated_at",
                        ],
                    )

        serializer = self.get_serializer(
            payment,
            context={
                "request": request,
            },
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
            .select_related(
                "order",
            )
            .filter(
                order__user=self.request.user,
            )
        )