from django.urls import path

from .views import (
    ReviewListCreateView,
    ReviewDetailView,
    ProductRatingView,
)


urlpatterns = [
    path(
        "",
        ReviewListCreateView.as_view(),
        name="review-list-create",
    ),
    path(
        "<int:pk>/",
        ReviewDetailView.as_view(),
        name="review-detail",
    ),
    path(
        "product/<int:product_id>/rating/",
        ProductRatingView.as_view(),
        name="product-rating",
    ),
]