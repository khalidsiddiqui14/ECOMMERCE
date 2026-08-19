import re

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

        if not re.fullmatch(
            r"^\+?[0-9]{7,15}$",
            value,
        ):
            raise serializers.ValidationError(
                "Please provide a valid phone number."
            )

        return value

    def validate_address_line(self, value):
        value = value.strip()

        if len(value) < 5:
            raise serializers.ValidationError(
                "Address must contain at least 5 characters."
            )

        return value

    def validate_city(self, value):
        value = value.strip()

        if len(value) < 2:
            raise serializers.ValidationError(
                "City must contain at least 2 characters."
            )

        return value

    def validate_state(self, value):
        value = value.strip()

        if len(value) < 2:
            raise serializers.ValidationError(
                "State must contain at least 2 characters."
            )

        return value

    def validate_country(self, value):
        value = value.strip()

        if len(value) < 2:
            raise serializers.ValidationError(
                "Country must contain at least 2 characters."
            )

        return value

    def validate_postal_code(self, value):
        value = value.strip()

        if not re.fullmatch(
            r"^[A-Za-z0-9][A-Za-z0-9 -]{2,19}$",
            value,
        ):
            raise serializers.ValidationError(
                "Please provide a valid postal code."
            )

        return value