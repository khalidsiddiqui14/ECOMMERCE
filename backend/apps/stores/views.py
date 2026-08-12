from django.shortcuts import get_object_or_404

from rest_framework import generics
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated

from apps.core.permissions import IsVendor
from apps.vendors.models import Vendor

from .models import Store
from .serializers import StoreSerializer


class StoreCreateView(generics.CreateAPIView):
    serializer_class = StoreSerializer
    permission_classes = [IsAuthenticated, IsVendor]

    def perform_create(self, serializer):
        vendor = get_object_or_404(
            Vendor,
            user=self.request.user,
        )

        if Store.objects.filter(vendor=vendor).exists():
            raise ValidationError(
                "Store already exists for this vendor."
            )

        serializer.save(vendor=vendor)


class StoreDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = StoreSerializer
    permission_classes = [IsAuthenticated, IsVendor]

    def get_object(self):
        vendor = get_object_or_404(
            Vendor,
            user=self.request.user,
        )

        return get_object_or_404(
            Store,
            vendor=vendor,
        )