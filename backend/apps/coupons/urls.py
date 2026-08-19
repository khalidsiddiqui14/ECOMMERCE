from django.urls import path

from .views import (
    CouponListCreateView,
    CouponDetailView,
    CouponValidateView,
    CouponUseView,
)


urlpatterns = [
    path(
        "",
        CouponListCreateView.as_view(),
        name="coupon-list-create",
    ),
    path(
        "<int:pk>/",
        CouponDetailView.as_view(),
        name="coupon-detail",
    ),
    path(
        "validate/",
        CouponValidateView.as_view(),
        name="coupon-validate",
    ),
    path(
        "use/",
        CouponUseView.as_view(),
        name="coupon-use",
    ),
]