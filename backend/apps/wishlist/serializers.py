from rest_framework import serializers

from .models import Wishlist, WishlistItem


class WishlistItemSerializer(serializers.ModelSerializer):
    # Return the product name in the wishlist response
    product_name = serializers.CharField(
        source="product.name",
        read_only=True,
    )

    # Return the current product price in the wishlist response
    price = serializers.DecimalField(
        source="product.price",
        max_digits=10,
        decimal_places=2,
        read_only=True,
    )

    class Meta:
        model = WishlistItem

        fields = (
            "id",
            "product",
            "product_name",
            "price",
            "created_at",
        )

        read_only_fields = (
            "id",
            "product_name",
            "price",
            "created_at",
        )

    # Validate that the selected product is available
    def validate_product(self, value):
        if not value.is_active:
            raise serializers.ValidationError(
                "This product is currently inactive."
            )

        if value.status != "PUBLISHED":
            raise serializers.ValidationError(
                "This product is not available."
            )

        return value


class WishlistSerializer(serializers.ModelSerializer):
    # Include all wishlist items in the response
    items = WishlistItemSerializer(
        many=True,
        read_only=True,
    )

    class Meta:
        model = Wishlist

        fields = (
            "id",
            "user",
            "items",
            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "user",
            "items",
            "created_at",
            "updated_at",
        )