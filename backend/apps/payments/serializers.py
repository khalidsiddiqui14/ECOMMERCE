from decimal import Decimal
from rest_framework import serializers
from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            "id",
            "order",
            "transaction_id",
            "amount",
            "payment_method",
            "status",
            "gateway_response",
            "paid_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "transaction_id",
            "amount",
            "status",
            "gateway_response",
            "paid_at",
            "created_at",
            "updated_at",
        ]

    def validate_order(self, value):
        if value is None:
            raise serializers.ValidationError("Order ID is required.")
        # Order object already validated by view's get_object_or_404 for owner,
        # but also handle raw id validation if serializer gets id directly
        return value

    def validate_payment_method(self, value):
        allowed = {choice[0] for choice in Payment.METHOD_CHOICES}
        if value not in allowed:
            raise serializers.ValidationError("Invalid payment method.")
        return value