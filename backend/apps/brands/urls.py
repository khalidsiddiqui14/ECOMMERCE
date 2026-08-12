from django.urls import path

from .views import BrandListCreateView, BrandDetailView


urlpatterns = [
    path(
        "",
        BrandListCreateView.as_view(),
        name="brand-list",
    ),
    path(
        "<int:pk>/",
        BrandDetailView.as_view(),
        name="brand-detail",
    ),
]