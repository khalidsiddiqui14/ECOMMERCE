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

    # Validate and normalize the store name
    def validate_name(self, value):
        value = value.strip()

        if len(value) < 3:
            raise serializers.ValidationError(
                "Store name must contain at least 3 characters."
            )

        return value

    # Validate and normalize the store slug
    def validate_slug(self, value):
        value = value.strip().lower()

        if len(value) < 3:
            raise serializers.ValidationError(
                "Store slug must contain at least 3 characters."
            )

        return value

    # Normalize the store email
    def validate_email(self, value):
        return value.strip().lower()

    # Normalize the store phone number
    def validate_phone(self, value):
        return value.strip()

    # Normalize the store address
    def validate_address(self, value):
        return value.strip()

    # Normalize the store city
    def validate_city(self, value):
        return value.strip()

    # Normalize the store state
    def validate_state(self, value):
        return value.strip()

    # Normalize the store country
    def validate_country(self, value):
        return value.strip()

    # Normalize the store postal code
    def validate_postal_code(self, value):
        return value.strip()