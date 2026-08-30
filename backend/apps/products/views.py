from django.shortcuts import get_object_or_404

from drf_spectacular.utils import (
    OpenApiParameter,
    OpenApiTypes,
    extend_schema,
)

from rest_framework import viewsets
from rest_framework.exceptions import (
    PermissionDenied,
    ValidationError,
)
from rest_framework.permissions import (
    BasePermission,
    SAFE_METHODS,
)

from apps.stores.models import Store

from .models import Product, ProductImage
from .serializers import (
    ProductSerializer,
    ProductImageSerializer,
)


class IsAdminOrVendorOrReadOnly(BasePermission):

    # Allow everyone to read and only admins or vendors
    # to modify products.
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True

        if not request.user.is_authenticated:
            return False

        return request.user.role in (
            "ADMIN",
            "VENDOR",
        )


class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [
        IsAdminOrVendorOrReadOnly,
    ]

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
        if getattr(
            self,
            "swagger_fake_view",
            False,
        ):
            return Product.objects.none()

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

    def perform_create(self, serializer):
        user = self.request.user

        if user.role == "ADMIN":
            store_id = self.request.data.get(
                "store",
            )

            if not store_id:
                raise ValidationError(
                    {
                        "store": (
                            "Store is required when an "
                            "admin creates a product."
                        ),
                    }
                )

            store = get_object_or_404(
                Store,
                pk=store_id,
            )

            if not store.is_active:
                raise ValidationError(
                    {
                        "store": (
                            "Cannot create a product "
                            "for an inactive store."
                        ),
                    }
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

    def perform_update(self, serializer):
        user = self.request.user

        if user.role == "ADMIN":
            store = serializer.instance.store

            if not store.is_active:
                raise ValidationError(
                    {
                        "store": (
                            "Cannot update a product "
                            "from an inactive store."
                        ),
                    }
                )

            serializer.save(
                store=store,
            )
            return

        if user.role != "VENDOR":
            raise PermissionDenied(
                "You do not have permission to update products."
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

        if serializer.instance.store_id != store.id:
            raise PermissionDenied(
                "You can only update your own products."
            )

        serializer.save(
            store=store,
        )

    def perform_destroy(self, instance):
        user = self.request.user

        if user.role == "ADMIN":
            instance.delete()
            return

        if user.role != "VENDOR":
            raise PermissionDenied(
                "You do not have permission to delete products."
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

        if instance.store_id != store.id:
            raise PermissionDenied(
                "You can only delete your own products."
            )

        instance.delete()


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

    def get_queryset(self):
        if getattr(
            self,
            "swagger_fake_view",
            False,
        ):
            return ProductImage.objects.none()

        product_id = self.kwargs.get(
            "product_pk",
        )

        if not product_id:
            return ProductImage.objects.none()

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

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name="product_pk",
                type=OpenApiTypes.INT,
                location=OpenApiParameter.PATH,
                required=True,
            ),
        ],
    )
    def list(self, request, *args, **kwargs):
        return super().list(
            request,
            *args,
            **kwargs,
        )

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name="product_pk",
                type=OpenApiTypes.INT,
                location=OpenApiParameter.PATH,
                required=True,
            ),
        ],
    )
    def create(self, request, *args, **kwargs):
        return super().create(
            request,
            *args,
            **kwargs,
        )

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name="product_pk",
                type=OpenApiTypes.INT,
                location=OpenApiParameter.PATH,
                required=True,
            ),
            OpenApiParameter(
                name="id",
                type=OpenApiTypes.INT,
                location=OpenApiParameter.PATH,
                required=True,
            ),
        ],
    )
    def destroy(self, request, *args, **kwargs):
        return super().destroy(
            request,
            *args,
            **kwargs,
        )

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