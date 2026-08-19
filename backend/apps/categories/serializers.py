from rest_framework import serializers

from .models import Category


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category

        fields = (
            "id",
            "name",
            "slug",
            "description",
            "image",
            "is_active",
            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "created_at",
            "updated_at",
        )

    # Validate and normalize the category name
    def validate_name(self, value):
        value = value.strip()

        if len(value) < 3:
            raise serializers.ValidationError(
                "Category name must contain at least 3 characters."
            )

        return value

    # Normalize the category slug
    def validate_slug(self, value):
        value = value.strip().lower()

        if len(value) < 3:
            raise serializers.ValidationError(
                "Category slug must contain at least 3 characters."
            )

        return value

    # Normalize the category description
    def validate_description(self, value):
        return value.strip()