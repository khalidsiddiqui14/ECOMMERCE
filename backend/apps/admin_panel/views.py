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

class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_staff

class AdminProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().order_by('-created_at')
    serializer_class = AdminProductSerializer
    permission_classes = [IsAdminUser]

class AdminCategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = AdminCategorySerializer
    permission_classes = [IsAdminUser]

class AdminOrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().order_by('-created_at')
    serializer_class = AdminOrderSerializer
    permission_classes = [IsAdminUser]
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        order = self.get_object()
        new_status = request.data.get('status')
        if not new_status:
            return Response({'error': 'Status is required'}, status=400)
        order.status = new_status
        order.save()
        return Response({'status': 'updated', 'new_status': new_status})

class AdminUserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdminUser]
    http_method_names = ['get', 'delete', 'patch', 'head', 'options']

class AdminActivityLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AdminActivityLog.objects.all().order_by('-timestamp')
    serializer_class = AdminActivityLogSerializer
    permission_classes = [IsAdminUser]

class SiteConfigurationViewSet(viewsets.ModelViewSet):
    queryset = SiteConfiguration.objects.all()
    serializer_class = SiteConfigurationSerializer
    permission_classes = [IsAdminUser]

class AdminDashboardView(APIView):
    permission_classes = [IsAdminUser]
    def get(self, request):
        try:
            data = {
                'total_users': User.objects.count(),
                'total_products': Product.objects.count(),
                'total_orders': Order.objects.count(),
                'total_categories': Category.objects.count(),
                'recent_orders': list(Order.objects.order_by('-created_at')[:5].values('id', 'status')),
            }
            return Response(data)
        except Exception as e:
            # Fallback if any model query fails
            return Response({
                'total_users': User.objects.count(),
                'total_products': Product.objects.count(),
                'total_orders': Order.objects.count(),
                'total_categories': Category.objects.count(),
                'error': str(e)
            })