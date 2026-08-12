from rest_framework import serializers

from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem

        fields = (
            "id",
            "product",
            "product_name",
            "sku",
            "price",
            "quantity",
            "total_price",
        )

        read_only_fields = (
            "id",
            "product_name",
            "sku",
            "price",
            "total_price",
        )


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(
        many=True,
        read_only=True,
    )

    class Meta:
        model = Order

        fields = (
            "id",
            "order_number",
            "status",
            "payment_status",
            "subtotal",
            "shipping_cost",
            "total_amount",
            "shipping_name",
            "shipping_phone",
            "shipping_address",
            "shipping_city",
            "shipping_state",
            "shipping_country",
            "shipping_postal_code",
            "notes",
            "items",
            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "order_number",
            "status",
            "payment_status",
            "subtotal",
            "total_amount",
            "items",
            "created_at",
            "updated_at",
        )

    def validate_shipping_name(self, value):
        value = value.strip()

        if len(value) < 2:
            raise serializers.ValidationError(
                "Shipping name must contain at least 2 characters."
            )

        return value

    def validate_shipping_phone(self, value):
        value = value.strip()

        if len(value) < 7:
            raise serializers.ValidationError(
                "Please provide a valid shipping phone number."
            )

        return value

    def validate_shipping_postal_code(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Shipping postal code is required."
            )

        return value