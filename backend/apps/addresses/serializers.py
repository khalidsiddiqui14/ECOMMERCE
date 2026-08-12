from rest_framework import serializers

from .models import Address


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address

        fields = (
            "id",
            "address_type",
            "full_name",
            "phone",
            "address_line",
            "city",
            "state",
            "country",
            "postal_code",
            "is_default",
            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "created_at",
            "updated_at",
        )

    def validate_full_name(self, value):
        value = value.strip()

        if len(value) < 2:
            raise serializers.ValidationError(
                "Full name must contain at least 2 characters."
            )

        return value

    def validate_phone(self, value):
        value = value.strip()

        if len(value) < 7:
            raise serializers.ValidationError(
                "Please provide a valid phone number."
            )

        return value

    def validate_postal_code(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Postal code is required."
            )

        return value