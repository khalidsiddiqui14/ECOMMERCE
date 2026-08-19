from django.shortcuts import get_object_or_404

from rest_framework import viewsets
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import BasePermission, SAFE_METHODS

from apps.stores.models import Store

from .models import Product, ProductImage
from .serializers import ProductSerializer, ProductImageSerializer


class IsAdminOrVendorOrReadOnly(BasePermission):

    # Allow everyone to read and only admins or vendors to modify products
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

    # Return products according to the user's role
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
                store__vendor__user=user,
            )

        return queryset.filter(
            status="PUBLISHED",
            is_active=True,
        )

    # Assign the product to the correct store during creation
    def perform_create(self, serializer):
        user = self.request.user

        if user.role == "ADMIN":
            store_id = self.request.data.get("store")

            if not store_id:
                raise ValidationError(
                    "Store is required when an admin creates a product."
                )

            store = get_object_or_404(
                Store,
                pk=store_id,
            )

            if not store.is_active:
                raise ValidationError(
                    "Cannot create a product for an inactive store."
                )

            serializer.save(
                store=store,
            )
            return

        if user.role != "VENDOR":
            raise PermissionDenied(
                "You do not have permission to create products."
            )

        vendor = getattr(
            user,
            "vendor",
            None,
        )

        if not vendor:
            raise PermissionDenied(
                "Vendor profile does not exist."
            )

        store = getattr(
            vendor,
            "store",
            None,
        )

        if not store:
            raise PermissionDenied(
                "Store does not exist for this vendor."
            )

        if not store.is_active:
            raise PermissionDenied(
                "Your store is inactive."
            )

        serializer.save(
            store=store,
        )


class ProductImageViewSet(viewsets.ModelViewSet):
    serializer_class = ProductImageSerializer
    permission_classes = [
        IsAdminOrVendorOrReadOnly,
    ]

    http_method_names = [
        "get",
        "post",
        "delete",
        "head",
        "options",
    ]

    # Return images according to the user's role
    def get_queryset(self):
        product_id = self.kwargs["product_pk"]

        queryset = (
            ProductImage.objects
            .filter(
                product_id=product_id,
            )
            .select_related(
                "product",
                "product__store",
                "product__store__vendor",
            )
        )

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
                product__store__vendor__user=user,
            )

        return queryset.filter(
            product__status="PUBLISHED",
            product__is_active=True,
        )

    # Attach the image to the selected product
    def perform_create(self, serializer):
        product = get_object_or_404(
            Product,
            pk=self.kwargs["product_pk"],
        )

        user = self.request.user

        if user.role == "ADMIN":
            serializer.save(
                product=product,
            )
            return

        if user.role == "VENDOR":
            vendor = getattr(
                user,
                "vendor",
                None,
            )

            if not vendor:
                raise PermissionDenied(
                    "Vendor profile does not exist."
                )

            store = getattr(
                vendor,
                "store",
                None,
            )

            if not store:
                raise PermissionDenied(
                    "Store does not exist for this vendor."
                )

            if product.store_id != store.id:
                raise PermissionDenied(
                    "You can only upload images for your own products."
                )

            if not store.is_active:
                raise PermissionDenied(
                    "Your store is inactive."
                )

            serializer.save(
                product=product,
            )
            return

        raise PermissionDenied(
            "You do not have permission to upload product images."
        )