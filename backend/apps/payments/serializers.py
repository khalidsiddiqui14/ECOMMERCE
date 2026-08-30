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

    def validate_order(self, value):
        request = self.context.get("request")

        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError(
                "Authentication is required."
            )

        if value.user_id != request.user.id:
            raise serializers.ValidationError(
                "You can only make payment for your own order."
            )

        if value.status == "CANCELLED":
            raise serializers.ValidationError(
                "Payment cannot be created for a cancelled order."
            )

        return value

    def validate_payment_method(self, value):
        allowed_methods = {
            choice[0]
            for choice in Payment.METHOD_CHOICES
        }

        if value not in allowed_methods:
            raise serializers.ValidationError(
                "Invalid payment method."
            )

        return value