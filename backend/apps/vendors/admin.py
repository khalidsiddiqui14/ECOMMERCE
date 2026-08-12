from django.contrib import admin

from .models import Vendor


@admin.register(Vendor)
class VendorAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "business_name",
        "user",
        "phone",
        "city",
        "country",
        "is_verified",
        "is_active",
    )

    list_filter = (
        "is_verified",
        "is_active",
        "country",
    )

    search_fields = (
        "business_name",
        "user__email",
        "phone",
    )

    ordering = ("-created_at",)