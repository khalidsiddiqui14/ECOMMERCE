from django.urls import path

from .views import VendorCreateView, VendorDetailView

urlpatterns = [
    path("", VendorCreateView.as_view(), name="vendor-create"),
    path("me/", VendorDetailView.as_view(), name="vendor-detail"),
]