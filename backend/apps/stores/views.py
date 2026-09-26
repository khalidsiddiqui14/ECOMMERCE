from django.shortcuts import get_object_or_404
from rest_framework import generics
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import BasePermission, SAFE_METHODS

from apps.vendors.models import Vendor

from .models import Store
from .serializers import StoreSerializer


class IsAdminOrVendorStore(BasePermission):

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        if request.method in SAFE_METHODS:
            return request.user.role in (
                "ADMIN",
                "VENDOR",
            )

        return request.user.role == "VENDOR"


class StoreCreateView(generics.ListCreateAPIView):
    serializer_class = StoreSerializer
    permission_classes = [IsAdminOrVendorStore]

    def get_queryset(self):
        user = self.request.user

        if user.role == "ADMIN":
            return Store.objects.all()

        vendor = get_object_or_404(
            Vendor,
            user=user,
        )

        return Store.objects.filter(
            vendor=vendor,
        )

    def perform_create(self, serializer):
        vendor = get_object_or_404(
            Vendor,
            user=self.request.user,
        )

        if Store.objects.filter(
            vendor=vendor,
        ).exists():
            raise ValidationError(
                "You already have a store."
            )

        serializer.save(
            vendor=vendor,
        )


class StoreDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = StoreSerializer
    permission_classes = [IsAdminOrVendorStore]

    def get_object(self):
        user = self.request.user

        if user.role == "ADMIN":
            store_id = self.request.query_params.get(
                "id"
            )

            if not store_id:
                raise ValidationError(
                    {
                        "id": (
                            "Store ID is required for admin."
                        ),
                    }
                )

            return get_object_or_404(
                Store,
                pk=store_id,
            )
        vendor = get_object_or_404(
            Vendor,
            user=user,
        )
        return get_object_or_404(
            Store,
            vendor=vendor,
        )