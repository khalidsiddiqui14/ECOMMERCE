from django.urls import path

from .views import StoreCreateView, StoreDetailView

urlpatterns = [
    path("", StoreCreateView.as_view(), name="store-create"),
    path("me/", StoreDetailView.as_view(), name="store-detail"),
]