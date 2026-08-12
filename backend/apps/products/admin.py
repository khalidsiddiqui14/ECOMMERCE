from django.contrib import admin

from .models import Product, ProductImage


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "sku",
        "store",
        "category",
        "brand",
        "price",
        "stock",
        "status",
        "is_active",
        "created_at",
    )

    search_fields = (
        "name",
        "sku",
        "description",
    )

    list_filter = (
        "status",
        "is_active",
        "category",
        "brand",
    )

    prepopulated_fields = {
        "slug": ("name",),
    }

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    ordering = (
        "-created_at",
    )

    inlines = [
        ProductImageInline,
    ]