from django.contrib import admin

from .models import Store


@admin.register(Store)
class StoreAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "vendor",
        "city",
        "country",
        "is_active",
    )

    list_filter = (
        "is_active",
        "country",
    )

    search_fields = (
        "name",
        "vendor__business_name",
    )

    prepopulated_fields = {
        "slug": ("name",)
    }

    ordering = ("-created_at",)