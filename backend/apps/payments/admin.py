from django.contrib import admin

from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "order",
        "amount",
        "payment_method",
        "status",
        "transaction_id",
        "created_at",
    )

    list_filter = (
        "status",
        "payment_method",
        "created_at",
    )

    search_fields = (
        "order__order_number",
        "transaction_id",
        "order__user__email",
    )

    readonly_fields = (
        "transaction_id",
        "amount",
        "gateway_response",
        "paid_at",
        "created_at",
        "updated_at",
    )

    ordering = (
        "-created_at",
    )