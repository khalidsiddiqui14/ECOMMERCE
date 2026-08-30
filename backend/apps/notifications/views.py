from django.shortcuts import get_object_or_404

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import (
    Notification,
    NotificationPreference,
)

from .serializers import (
    NotificationSerializer,
    NotificationPreferenceSerializer,
)


class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if getattr(
            self,
            "swagger_fake_view",
            False,
        ):
            return Notification.objects.none()

        return Notification.objects.filter(
            user=self.request.user,
        )


class NotificationDetailView(
    generics.RetrieveDestroyAPIView
):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if getattr(
            self,
            "swagger_fake_view",
            False,
        ):
            return Notification.objects.none()

        return Notification.objects.filter(
            user=self.request.user,
        )


class NotificationMarkReadView(
    generics.UpdateAPIView
):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    http_method_names = [
        "patch",
        "options",
    ]

    def get_queryset(self):
        if getattr(
            self,
            "swagger_fake_view",
            False,
        ):
            return Notification.objects.none()

        return Notification.objects.filter(
            user=self.request.user,
        )

    def patch(self, request, *args, **kwargs):
        notification = get_object_or_404(
            self.get_queryset(),
            pk=kwargs["pk"],
        )

        notification.is_read = True

        notification.save(
            update_fields=[
                "is_read",
                "updated_at",
            ],
        )

        serializer = self.get_serializer(
            notification,
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )


class NotificationPreferenceView(
    generics.RetrieveUpdateAPIView
):
    serializer_class = NotificationPreferenceSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        preference, created = (
            NotificationPreference.objects.get_or_create(
                user=self.request.user,
            )
        )

        return preference