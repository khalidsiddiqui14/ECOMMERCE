from django.shortcuts import get_object_or_404

from rest_framework import generics
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated

from .models import Vendor
from .permissions import IsVendor, IsVendorUser
from .serializers import VendorSerializer


class VendorCreateView(generics.CreateAPIView):
    serializer_class = VendorSerializer
    permission_classes = [
        IsAuthenticated,
        IsVendorUser,
    ]

    def perform_create(self, serializer):
        if Vendor.objects.filter(
            user=self.request.user,
        ).exists():
            raise ValidationError(
                "Vendor profile already exists."
            )

        serializer.save(
            user=self.request.user,
        )


class VendorDetailView(
    generics.RetrieveUpdateAPIView
):
    serializer_class = VendorSerializer
    permission_classes = [
        IsAuthenticated,
        IsVendor,
    ]

    def get_object(self):
        return get_object_or_404(
            Vendor,
            user=self.request.user,
        )