from django.shortcuts import render

# Create your views here.
from rest_framework import generics
from rest_framework.permissions import BasePermission, SAFE_METHODS

from .models import Brand
from .serializers import BrandSerializer


class IsAdminOrReadOnly(BasePermission):
    """
    Anyone can view brands.
    Only ADMIN users can create, update, or delete brands.
    """

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True

        return (
            request.user.is_authenticated
            and request.user.role == "ADMIN"
        )


class BrandListCreateView(generics.ListCreateAPIView):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer
    permission_classes = [IsAdminOrReadOnly]

    search_fields = [
        "name",
        "description",
    ]

    filterset_fields = [
        "is_active",
    ]

    ordering_fields = [
        "name",
        "created_at",
    ]

    ordering = [
        "name",
    ]


class BrandDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer
    permission_classes = [IsAdminOrReadOnly]