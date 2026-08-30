from rest_framework import serializers

from .models import Brand


class BrandSerializer(serializers.ModelSerializer):
    slug = serializers.CharField(
        required=False,
        allow_blank=True,
    )

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

    def validate_name(self, value):
        value = value.strip()

        if len(value) < 2:
            raise serializers.ValidationError(
                "Brand name must contain at least 2 characters."
            )

        queryset = Brand.objects.filter(
            name__iexact=value
        )

        if self.instance:
            queryset = queryset.exclude(
                pk=self.instance.pk
            )

        if queryset.exists():
            raise serializers.ValidationError(
                "A brand with this name already exists."
            )

        return value

    def validate_slug(self, value):
        value = value.strip().lower()

        if not value:
            return value

        if len(value) < 2:
            raise serializers.ValidationError(
                "Brand slug must contain at least 2 characters."
            )

        if not all(
            character.isalnum() or character in "-_"
            for character in value
        ):
            raise serializers.ValidationError(
                "Brand slug may contain only letters, numbers, hyphens, and underscores."
            )

        queryset = Brand.objects.filter(
            slug__iexact=value
        )

        if self.instance:
            queryset = queryset.exclude(
                pk=self.instance.pk
            )

        if queryset.exists():
            raise serializers.ValidationError(
                "A brand with this slug already exists."
            )

        return value

    def validate_description(self, value):
        return value.strip()