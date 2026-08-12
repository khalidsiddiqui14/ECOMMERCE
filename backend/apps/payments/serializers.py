from rest_framework import serializers

from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment

        fields = (
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
        )

        read_only_fields = (
            "id",
            "transaction_id",
            "amount",
            "status",
            "gateway_response",
            "paid_at",
            "created_at",
            "updated_at",
        )