from rest_framework import serializers

from .models import Vendor


class VendorSerializer(serializers.ModelSerializer):
    # Keep the vendor user relationship read-only
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Vendor
        fields = (
            "id",
            "user",
            "business_name",
            "phone",
            "gst_number",
            "address",
            "city",
            "state",
            "country",
            "postal_code",
            "is_verified",
            "is_active",
            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "user",
            "is_verified",
            "created_at",
            "updated_at",
        )

    # Validate and normalize the business name
    def validate_business_name(self, value):
        value = value.strip()

        if len(value) < 3:
            raise serializers.ValidationError(
                "Business name must contain at least 3 characters."
            )

        return value

    # Validate and normalize the vendor phone number
    def validate_phone(self, value):
        value = value.strip()

        queryset = Vendor.objects.filter(phone=value)

        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)

        if queryset.exists():
            raise serializers.ValidationError(
                "This phone number is already in use."
            )

        return value

    # Validate and normalize the GST number
    def validate_gst_number(self, value):
        if not value:
            return value

        value = value.strip().upper()

        queryset = Vendor.objects.filter(gst_number=value)

        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)

        if queryset.exists():
            raise serializers.ValidationError(
                "This GST number already exists."
            )

        return value