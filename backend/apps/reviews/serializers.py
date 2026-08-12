from rest_framework import serializers

from .models import Review


class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(
        source="user.username",
        read_only=True,
    )

    product_name = serializers.CharField(
        source="product.name",
        read_only=True,
    )

    class Meta:
        model = Review

        fields = (
            "id",
            "user",
            "user_name",
            "product",
            "product_name",
            "rating",
            "comment",
            "is_active",
            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "user",
            "user_name",
            "product_name",
            "is_active",
            "created_at",
            "updated_at",
        )

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError(
                "Rating must be between 1 and 5."
            )

        return value