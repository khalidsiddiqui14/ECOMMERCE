from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AdminProductViewSet, 
    AdminOrderViewSet, 
    AdminUserViewSet, 
    AdminCategoryViewSet,
    AdminDashboardView,
    AdminActivityLogViewSet,
    SiteConfigurationViewSet
)

router = DefaultRouter()
router.register(r'products', AdminProductViewSet, basename='admin-products')
router.register(r'categories', AdminCategoryViewSet, basename='admin-categories')
router.register(r'orders', AdminOrderViewSet, basename='admin-orders')
router.register(r'users', AdminUserViewSet, basename='admin-users')
router.register(r'logs', AdminActivityLogViewSet, basename='admin-logs')
router.register(r'settings', SiteConfigurationViewSet, basename='admin-settings')

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/stats/', AdminDashboardView.as_view(), name='admin-dashboard-stats'),
]