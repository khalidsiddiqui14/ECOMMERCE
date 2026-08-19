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
    # Include product images in product responses
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

    # Validate and normalize the product name
    def validate_name(self, value):
        value = value.strip()

        if len(value) < 3:
            raise serializers.ValidationError(
                "Product name must contain at least 3 characters."
            )

        return value

    # Normalize the product slug
    def validate_slug(self, value):
        value = value.strip().lower()

        if len(value) < 3:
            raise serializers.ValidationError(
                "Product slug must contain at least 3 characters."
            )

        return value

    # Normalize the product SKU
    def validate_sku(self, value):
        value = value.strip().upper()

        if len(value) < 2:
            raise serializers.ValidationError(
                "Product SKU must contain at least 2 characters."
            )

        return value

    # Normalize the product description
    def validate_description(self, value):
        return value.strip()

    # Validate the product price
    def validate_price(self, value):
        if value < 0:
            raise serializers.ValidationError(
                "Price cannot be negative."
            )

        return value

    # Validate the product stock
    def validate_stock(self, value):
        if value < 0:
            raise serializers.ValidationError(
                "Stock cannot be negative."
            )

        return value

    # Validate the selected category
    def validate_category(self, value):
        if not value.is_active:
            raise serializers.ValidationError(
                "Selected category is inactive."
            )

        return value

    # Validate the selected brand
    def validate_brand(self, value):
        if value and not value.is_active:
            raise serializers.ValidationError(
                "Selected brand is inactive."
            )

        return value