from rest_framework.permissions import BasePermission


class IsVendor(BasePermission):

    # Allow access only to active vendor users
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        if request.user.role != "VENDOR":
            return False

        if not hasattr(request.user, "vendor"):
            return False

        return request.user.vendor.is_active