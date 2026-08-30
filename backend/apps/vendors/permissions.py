from rest_framework.permissions import BasePermission

from .models import Vendor


class IsVendorUser(BasePermission):

    # Allow authenticated users with the vendor role.
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        return request.user.role == "VENDOR"


class IsVendor(BasePermission):

    # Allow access only to active vendor users.
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        if request.user.role != "VENDOR":
            return False

        return Vendor.objects.filter(
            user=request.user,
            is_active=True,
        ).exists()