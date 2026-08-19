from django.utils import timezone

from rest_framework import serializers

from .models import Coupon


class CouponSerializer(serializers.ModelSerializer):
    is_started = serializers.BooleanField(
        read_only=True,
    )

    is_expired = serializers.BooleanField(
        read_only=True,
    )

    is_usage_limit_reached = serializers.BooleanField(
        read_only=True,
    )

    is_valid = serializers.BooleanField(
        read_only=True,
    )

    class Meta:
        model = Coupon

        fields = (
            "id",
            "code",
            "discount_type",
            "discount_value",
            "minimum_order_amount",
            "maximum_discount_amount",
            "usage_limit",
            "used_count",
            "per_user_limit",
            "start_date",
            "end_date",
            "is_active",
            "is_started",
            "is_expired",
            "is_usage_limit_reached",
            "is_valid",
            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "used_count",
            "is_started",
            "is_expired",
            "is_usage_limit_reached",
            "is_valid",
            "created_at",
            "updated_at",
        )

    def validate_code(self, value):
        value = value.strip().upper()

        if len(value) < 3:
            raise serializers.ValidationError(
                "Coupon code must contain at least 3 characters."
            )

        return value

    def validate_discount_value(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "Discount value must be greater than zero."
            )

        return value

    def validate_minimum_order_amount(self, value):
        if value < 0:
            raise serializers.ValidationError(
                "Minimum order amount cannot be negative."
            )

        return value

    def validate_maximum_discount_amount(self, value):
        if value is not None and value <= 0:
            raise serializers.ValidationError(
                "Maximum discount amount must be greater than zero."
            )

        return value

    def validate_usage_limit(self, value):
        if value is not None and value < 1:
            raise serializers.ValidationError(
                "Usage limit must be at least 1."
            )

        return value

    def validate_per_user_limit(self, value):
        if value < 1:
            raise serializers.ValidationError(
                "Per-user limit must be at least 1."
            )

        return value

    def validate_start_date(self, value):
        if not value:
            raise serializers.ValidationError(
                "Start date is required."
            )

        return value

    def validate_end_date(self, value):
        if not value:
            raise serializers.ValidationError(
                "End date is required."
            )

        return value

    def validate(self, attrs):
        discount_type = attrs.get(
            "discount_type",
            getattr(
                self.instance,
                "discount_type",
                None,
            ),
        )

        discount_value = attrs.get(
            "discount_value",
            getattr(
                self.instance,
                "discount_value",
                None,
            ),
        )

        minimum_order_amount = attrs.get(
            "minimum_order_amount",
            getattr(
                self.instance,
                "minimum_order_amount",
                None,
            ),
        )

        maximum_discount_amount = attrs.get(
            "maximum_discount_amount",
            getattr(
                self.instance,
                "maximum_discount_amount",
                None,
            ),
        )

        start_date = attrs.get(
            "start_date",
            getattr(
                self.instance,
                "start_date",
                None,
            ),
        )

        end_date = attrs.get(
            "end_date",
            getattr(
                self.instance,
                "end_date",
                None,
            ),
        )

        if (
            start_date
            and end_date
            and end_date <= start_date
        ):
            raise serializers.ValidationError(
                {
                    "end_date": (
                        "End date must be later than "
                        "start date."
                    )
                }
            )

        if (
            discount_type == "PERCENTAGE"
            and discount_value is not None
            and discount_value > 100
        ):
            raise serializers.ValidationError(
                {
                    "discount_value": (
                        "Percentage discount cannot "
                        "exceed 100."
                    )
                }
            )

        if (
            maximum_discount_amount is not None
            and minimum_order_amount is not None
            and maximum_discount_amount > 0
            and minimum_order_amount > 0
            and discount_type == "FIXED"
            and discount_value > minimum_order_amount
        ):
            raise serializers.ValidationError(
                {
                    "discount_value": (
                        "Fixed discount cannot exceed "
                        "minimum order amount."
                    )
                }
            )

        return attrs