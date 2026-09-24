from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model

from apps.products.models import Product
from apps.categories.models import Category
from apps.orders.models import Order

from .models import AdminActivityLog, SiteConfiguration
from .serializers import (
    AdminProductSerializer,
    AdminCategorySerializer,
    AdminOrderSerializer,
    AdminUserSerializer,
    AdminActivityLogSerializer,
    SiteConfigurationSerializer
)


User = get_user_model()


# Admin permission
class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.is_staff
        )


# Product management
class AdminProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().order_by("-created_at")
    serializer_class = AdminProductSerializer
    permission_classes = [IsAdminUser]


# Category management
class AdminCategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = AdminCategorySerializer
    permission_classes = [IsAdminUser]


# Order management
class AdminOrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().order_by("-created_at")
    serializer_class = AdminOrderSerializer
    permission_classes = [IsAdminUser]

    # Update order status
    @action(detail=True, methods=["post"])
    def update_status(self, request, pk=None):
        order = self.get_object()

        new_status = request.data.get("status")

        if not new_status:
            return Response(
                {"error": "Status is required"},
                status=400
            )

        order.status = new_status
        order.save()

        return Response({
            "status": "updated",
            "new_status": new_status
        })


# User management
class AdminUserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by("-date_joined")
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdminUser]

    http_method_names = [
        "get",
        "delete",
        "patch",
        "head",
        "options"
    ]

    # Deactivate user
    @action(detail=True, methods=["patch"])
    def deactivate(self, request, pk=None):
        user = self.get_object()

        # Prevent admin from deactivating themselves
        if user.id == request.user.id:
            return Response(
                {
                    "error": (
                        "You cannot deactivate your own admin account."
                    )
                },
                status=400
            )

        user.is_active = False

        user.save(
            update_fields=["is_active"]
        )

        return Response({
            "message": "User deactivated successfully.",
            "user_id": user.id,
            "is_active": user.is_active
        })

    # Activate user
    @action(detail=True, methods=["patch"])
    def activate(self, request, pk=None):
        user = self.get_object()

        user.is_active = True

        user.save(
            update_fields=["is_active"]
        )

        return Response({
            "message": "User activated successfully.",
            "user_id": user.id,
            "is_active": user.is_active
        })

    # Delete user
    def destroy(self, request, *args, **kwargs):
        user = self.get_object()

        # Prevent admin from deleting their own account
        if user.id == request.user.id:
            return Response(
                {
                    "error": (
                        "You cannot delete your own admin account."
                    )
                },
                status=400
            )

        user_id = user.id
        user_email = user.email

        user.delete()

        return Response(
            {
                "success": True,
                "message": "User deleted successfully.",
                "user_id": user_id,
                "email": user_email
            },
            status=200
        )


# Admin activity logs
class AdminActivityLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AdminActivityLog.objects.all().order_by("-timestamp")
    serializer_class = AdminActivityLogSerializer
    permission_classes = [IsAdminUser]


# Site configuration
class SiteConfigurationViewSet(viewsets.ModelViewSet):
    queryset = SiteConfiguration.objects.all()
    serializer_class = SiteConfigurationSerializer
    permission_classes = [IsAdminUser]


# Admin dashboard
class AdminDashboardView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        try:
            data = {
                "total_users": User.objects.count(),
                "total_products": Product.objects.count(),
                "total_orders": Order.objects.count(),
                "total_categories": Category.objects.count(),
                "recent_orders": list(
                    Order.objects
                    .order_by("-created_at")[:5]
                    .values("id", "status")
                ),
            }

            return Response(data)

        except Exception as e:
            # Dashboard fallback
            return Response({
                "total_users": User.objects.count(),
                "total_products": Product.objects.count(),
                "total_orders": Order.objects.count(),
                "total_categories": Category.objects.count(),
                "error": str(e)
            })