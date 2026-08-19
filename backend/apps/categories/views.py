from rest_framework import generics
from rest_framework.permissions import BasePermission, SAFE_METHODS

from .models import Category
from .serializers import CategorySerializer


class IsAdminOrReadOnly(BasePermission):

    # Allow everyone to view categories and only admins to modify them
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True

        return (
            request.user.is_authenticated
            and request.user.role == "ADMIN"
        )


class CategoryListCreateView(generics.ListCreateAPIView):
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]

    search_fields = [
        "name",
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

    # Return active categories publicly and all categories to admins
    def get_queryset(self):
        queryset = Category.objects.all()

        if (
            self.request.user.is_authenticated
            and self.request.user.role == "ADMIN"
        ):
            return queryset

        return queryset.filter(
            is_active=True,
        )


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]

    # Return active categories publicly and all categories to admins
    def get_queryset(self):
        queryset = Category.objects.all()

        if (
            self.request.user.is_authenticated
            and self.request.user.role == "ADMIN"
        ):
            return queryset

        return queryset.filter(
            is_active=True,
        )