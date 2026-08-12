from django.contrib import admin

from .models import Address


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "full_name",
        "phone",
        "city",
        "state",
        "address_type",
        "is_default",
        "created_at",
    )

    list_filter = (
        "address_type",
        "is_default",
        "city",
        "state",
    )

    search_fields = (
        "user__email",
        "user__username",
        "full_name",
        "phone",
        "city",
        "postal_code",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    ordering = (
        "-is_default",
        "-created_at",
    )