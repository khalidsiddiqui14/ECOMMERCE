from rest_framework import serializers

from .models import Cart, CartItem


class CartItemSerializer(serializers.ModelSerializer):
    # Return the product name in the cart response
    product_name = serializers.CharField(
        source="product.name",
        read_only=True,
    )

    # Return the current product price in the cart response
    price = serializers.DecimalField(
        source="product.price",
        max_digits=10,
        decimal_places=2,
        read_only=True,
    )

    # Return the calculated item total
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

    # Validate cart item quantity
    def validate_quantity(self, value):
        if value < 1:
            raise serializers.ValidationError(
                "Quantity must be at least 1."
            )

        return value

    # Validate product availability and stock
    def validate(self, attrs):
        product = attrs.get(
            "product",
            getattr(
                self.instance,
                "product",
                None,
            ),
        )

        quantity = attrs.get(
            "quantity",
            getattr(
                self.instance,
                "quantity",
                1,
            ),
        )

        if not product:
            return attrs

        if not product.is_active:
            raise serializers.ValidationError(
                {
                    "product": (
                        "This product is currently inactive."
                    )
                }
            )

        if product.status != "PUBLISHED":
            raise serializers.ValidationError(
                {
                    "product": (
                        "This product is not available "
                        "for purchase."
                    )
                }
            )

        if product.stock <= 0:
            raise serializers.ValidationError(
                {
                    "product": (
                        "This product is currently "
                        "out of stock."
                    )
                }
            )

        if quantity > product.stock:
            raise serializers.ValidationError(
                {
                    "quantity": (
                        f"Only {product.stock} item(s) "
                        "are available in stock."
                    )
                }
            )

        return attrs


class CartSerializer(serializers.ModelSerializer):
    # Include all items belonging to the cart
    items = CartItemSerializer(
        many=True,
        read_only=True,
    )

    # Return the calculated cart total
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