from django.contrib import admin

from .models import Coupon


@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = (
        "code",
        "discount_type",
        "discount_value",
        "minimum_order_amount",
        "usage_limit",
        "used_count",
        "start_date",
        "end_date",
        "is_active",
        "created_at",
    )

    list_filter = (
        "discount_type",
        "is_active",
        "start_date",
        "end_date",
    )

    search_fields = (
        "code",
    )

    ordering = (
        "-created_at",
    )

    readonly_fields = (
        "used_count",
        "created_at",
        "updated_at",
    )