from rest_framework import serializers

from .models import (
    Notification,
    NotificationPreference,
)


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification

        fields = (
            "id",
            "notification_type",
            "title",
            "message",
            "order",
            "is_read",
            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "notification_type",
            "title",
            "message",
            "order",
            "created_at",
            "updated_at",
        )


class NotificationPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationPreference

        fields = (
            "id",
            "order_updates",
            "promotions",
            "email_notifications",
            "push_notifications",
            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "created_at",
            "updated_at",
        )