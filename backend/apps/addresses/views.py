from django.db import transaction

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import Address
from .serializers import AddressSerializer


class AddressListCreateView(generics.ListCreateAPIView):
    serializer_class = AddressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            Address.objects
            .filter(user=self.request.user)
            .order_by("-is_default", "-created_at")
        )

    @transaction.atomic
    def perform_create(self, serializer):
        user = self.request.user
        is_default = serializer.validated_data.get(
            "is_default",
            False,
        )

        has_address = Address.objects.filter(
            user=user,
        ).exists()

        if not has_address:
            is_default = True

        if is_default:
            Address.objects.filter(
                user=user,
                is_default=True,
            ).update(
                is_default=False,
            )

        serializer.save(
            user=user,
            is_default=is_default,
        )


class AddressDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    serializer_class = AddressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(
            user=self.request.user,
        )

    @transaction.atomic
    def perform_update(self, serializer):
        user = self.request.user
        instance = serializer.instance

        is_default = serializer.validated_data.get(
            "is_default",
            instance.is_default,
        )

        if is_default:
            Address.objects.filter(
                user=user,
                is_default=True,
            ).exclude(
                id=instance.id,
            ).update(
                is_default=False,
            )

        serializer.save(
            user=user,
        )

    @transaction.atomic
    def perform_destroy(self, instance):
        user = self.request.user
        was_default = instance.is_default

        instance.delete()

        if was_default:
            next_address = (
                Address.objects
                .filter(user=user)
                .order_by("-created_at")
                .first()
            )

            if next_address:
                next_address.is_default = True
                next_address.save(
                    update_fields=[
                        "is_default",
                        "updated_at",
                    ]
                )