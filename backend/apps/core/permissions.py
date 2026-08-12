from rest_framework.permissions import BasePermission


class IsVendor(BasePermission):
    """
    Allow access only to users with VENDOR role.
    """

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == "VENDOR"
        )


class IsAdmin(BasePermission):
    """
    Allow access only to ADMIN users.
    """

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == "ADMIN"
        )