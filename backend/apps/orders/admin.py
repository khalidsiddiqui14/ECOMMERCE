from django.contrib import admin

from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = (
        "product_name",
        "sku",
        "price",
        "quantity",
        "total_price",
    )


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "order_number",
        "user",
        "status",
        "payment_status",
        "subtotal",
        "total_amount",
        "created_at",
    )

    list_filter = (
        "status",
        "payment_status",
        "created_at",
    )

    search_fields = (
        "order_number",
        "user__email",
        "user__username",
        "shipping_phone",
    )

    readonly_fields = (
        "order_number",
        "subtotal",
        "shipping_cost",
        "total_amount",
        "created_at",
        "updated_at",
    )

    ordering = (
        "-created_at",
    )

    inlines = [
        OrderItemInline,
    ]


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "order",
        "product_name",
        "sku",
        "price",
        "quantity",
        "total_price",
    )

    search_fields = (
        "product_name",
        "sku",
        "order__order_number",
    )

    readonly_fields = (
        "product_name",
        "sku",
        "price",
        "quantity",
        "total_price",
    )