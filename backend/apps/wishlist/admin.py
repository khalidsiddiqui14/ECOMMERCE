from django.contrib import admin

from .models import Wishlist, WishlistItem


class WishlistItemInline(admin.TabularInline):
    model = WishlistItem
    extra = 0


@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "created_at",
        "updated_at",
    )

    search_fields = (
        "user__email",
        "user__username",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    inlines = [
        WishlistItemInline,
    ]


@admin.register(WishlistItem)
class WishlistItemAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "wishlist",
        "product",
        "created_at",
    )

    search_fields = (
        "product__name",
        "product__sku",
        "wishlist__user__email",
    )

    list_filter = (
        "product__status",
    )