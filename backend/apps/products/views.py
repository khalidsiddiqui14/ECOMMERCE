from rest_framework import viewsets
from rest_framework.permissions import BasePermission, SAFE_METHODS
from rest_framework.exceptions import PermissionDenied

from .models import Product, ProductImage
from .serializers import ProductSerializer, ProductImageSerializer


class IsAdminOrVendorOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True

        if not request.user.is_authenticated:
            return False

        return request.user.role in ("ADMIN", "VENDOR")


class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [IsAdminOrVendorOrReadOnly]

    search_fields = [
        "name",
        "sku",
        "description",
    ]

    filterset_fields = [
        "category",
        "brand",
        "status",
        "is_active",
    ]

    ordering_fields = [
        "price",
        "created_at",
        "stock",
        "name",
    ]

    ordering = [
        "-created_at",
    ]

    def get_queryset(self):
        queryset = (
            Product.objects
            .select_related(
                "store",
                "category",
                "brand",
            )
            .prefetch_related(
                "images",
            )
        )

        user = self.request.user

        if not user.is_authenticated:
            return queryset.filter(
                status="PUBLISHED",
                is_active=True,
            )

        if user.role == "ADMIN":
            return queryset

        if user.role == "VENDOR":
            return queryset.filter(
                store__vendor__user=user
            )

        return queryset.filter(
            status="PUBLISHED",
            is_active=True,
        )

    def perform_create(self, serializer):
        user = self.request.user

        if user.role == "ADMIN":
            serializer.save()
            return

        vendor = user.vendor

        serializer.save(
            store=vendor.store
        )


class ProductImageViewSet(viewsets.ModelViewSet):
    serializer_class = ProductImageSerializer
    permission_classes = [
        IsAdminOrVendorOrReadOnly
    ]

    http_method_names = [
        "get",
        "post",
        "delete",
        "head",
        "options",
    ]

    def get_queryset(self):
        product_id = self.kwargs["product_pk"]

        queryset = ProductImage.objects.filter(
            product_id=product_id
        ).select_related("product")

        user = self.request.user

        if not user.is_authenticated:
            return queryset.filter(
                product__status="PUBLISHED",
                product__is_active=True,
            )

        if user.role == "ADMIN":
            return queryset

        if user.role == "VENDOR":
            return queryset.filter(
                product__store__vendor__user=user
            )

        return queryset.filter(
            product__status="PUBLISHED",
            product__is_active=True,
        )

    def perform_create(self, serializer):
        product = Product.objects.get(
            pk=self.kwargs["product_pk"]
        )

        user = self.request.user

        if user.role == "ADMIN":
            serializer.save(product=product)
            return

        if user.role == "VENDOR":
            if product.store.vendor.user != user:
                raise PermissionDenied(
                    "You can only upload images for your own products."
                )

            serializer.save(product=product)
            return

        raise PermissionDenied(
            "You do not have permission to upload product images."
        )