from rest_framework import serializers

from .models import Cart, CartItem


class CartItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(
        source="product.name",
        read_only=True,
    )

    price = serializers.DecimalField(
        source="product.price",
        max_digits=10,
        decimal_places=2,
        read_only=True,
    )

    total_price = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True,
    )

    class Meta:
        model = CartItem
        fields = (
            "id",
            "product",
            "product_name",
            "price",
            "quantity",
            "total_price",
        )

        read_only_fields = (
            "id",
            "product_name",
            "price",
            "total_price",
        )

    def validate_quantity(self, value):
        if value < 1:
            raise serializers.ValidationError(
                "Quantity must be at least 1."
            )

        return value

    def validate(self, attrs):
        product = attrs.get(
            "product",
            getattr(self.instance, "product", None),
        )

        quantity = attrs.get(
            "quantity",
            getattr(self.instance, "quantity", 1),
        )

        if product:
            if not product.is_active:
                raise serializers.ValidationError(
                    "This product is currently inactive."
                )

            if product.status != "PUBLISHED":
                raise serializers.ValidationError(
                    "This product is not available for purchase."
                )

            if quantity > product.stock:
                raise serializers.ValidationError(
                    f"Only {product.stock} item(s) are available in stock."
                )

        return attrs


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(
        many=True,
        read_only=True,
    )

    total_price = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True,
    )

    class Meta:
        model = Cart
        fields = (
            "id",
            "user",
            "items",
            "total_price",
            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "user",
            "items",
            "total_price",
            "created_at",
            "updated_at",
        )