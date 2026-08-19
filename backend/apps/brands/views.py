from rest_framework import generics
from rest_framework.permissions import BasePermission, SAFE_METHODS

from .models import Brand
from .serializers import BrandSerializer


class IsAdminOrReadOnly(BasePermission):

    # Allow everyone to view brands and only admins to modify them
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True

        return (
            request.user.is_authenticated
            and request.user.role == "ADMIN"
        )


class BrandListCreateView(generics.ListCreateAPIView):
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

    # Return active brands publicly and all brands to admins
    def get_queryset(self):
        queryset = Brand.objects.all()

        if (
            self.request.user.is_authenticated
            and self.request.user.role == "ADMIN"
        ):
            return queryset

        return queryset.filter(
            is_active=True,
        )


class BrandDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = BrandSerializer
    permission_classes = [IsAdminOrReadOnly]

    # Return active brands publicly and all brands to admins
    def get_queryset(self):
        queryset = Brand.objects.all()

        if (
            self.request.user.is_authenticated
            and self.request.user.role == "ADMIN"
        ):
            return queryset

        return queryset.filter(
            is_active=True,
        )