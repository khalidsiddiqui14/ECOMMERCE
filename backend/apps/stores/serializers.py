from rest_framework import serializers

from .models import Store


class StoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Store
        fields = (
            "id",
            "vendor",
            "name",
            "slug",
            "logo",
            "banner",
            "description",
            "email",
            "phone",
            "address",
            "city",
            "state",
            "country",
            "postal_code",
            "is_active",
            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "vendor",
            "created_at",
            "updated_at",
        )

    def validate_name(self, value):
        value = value.strip()

        if len(value) < 3:
            raise serializers.ValidationError(
                "Store name must contain at least 3 characters."
            )

        return value