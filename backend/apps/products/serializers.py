from rest_framework import serializers

from .models import Product, ProductImage


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage

        fields = (
            "id",
            "image",
            "is_primary",
        )

        read_only_fields = (
            "id",
        )


class ProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(
        many=True,
        read_only=True,
    )

    class Meta:
        model = Product

        fields = (
            "id",
            "store",
            "category",
            "brand",
            "name",
            "slug",
            "sku",
            "description",
            "price",
            "stock",
            "status",
            "is_active",
            "images",
            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "store",
            "created_at",
            "updated_at",
        )

    def validate_name(self, value):
        value = value.strip()

        if len(value) < 3:
            raise serializers.ValidationError(
                "Product name must contain at least 3 characters."
            )

        return value

    def validate_price(self, value):
        if value < 0:
            raise serializers.ValidationError(
                "Price cannot be negative."
            )

        return value

    def validate_stock(self, value):
        if value < 0:
            raise serializers.ValidationError(
                "Stock cannot be negative."
            )

        return value