from rest_framework import generics
from rest_framework.permissions import BasePermission, SAFE_METHODS

from .models import Category
from .serializers import CategorySerializer


class IsAdminOrReadOnly(BasePermission):
    """
    Anyone can view categories.
    Only ADMIN users can create, update, or delete categories.
    """

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True

        return (
            request.user.is_authenticated
            and request.user.role == "ADMIN"
        )


class CategoryListCreateView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
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


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]