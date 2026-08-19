from rest_framework import serializers

from .models import Brand


class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand

        fields = (
            "id",
            "name",
            "slug",
            "logo",
            "description",
            "is_active",
            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "created_at",
            "updated_at",
        )

    # Validate and normalize the brand name
    def validate_name(self, value):
        value = value.strip()

        if len(value) < 2:
            raise serializers.ValidationError(
                "Brand name must contain at least 2 characters."
            )

        return value

    # Normalize the brand slug
    def validate_slug(self, value):
        value = value.strip().lower()

        if len(value) < 2:
            raise serializers.ValidationError(
                "Brand slug must contain at least 2 characters."
            )

        return value

    # Normalize the brand description
    def validate_description(self, value):
        return value.strip()