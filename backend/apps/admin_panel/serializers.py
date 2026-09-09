from rest_framework import serializers
from django.contrib.auth import get_user_model
from apps.products.models import Product
from apps.categories.models import Category
from apps.orders.models import Order
from .models import AdminActivityLog, SiteConfiguration

User = get_user_model()

class AdminProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'

class AdminCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class AdminOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = '__all__'

class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'is_staff', 'is_active', 'date_joined']
        read_only_fields = ['date_joined']

class AdminActivityLogSerializer(serializers.ModelSerializer):
    admin_user_email = serializers.CharField(source='admin_user.email', read_only=True)
    class Meta:
        model = AdminActivityLog
        fields = '__all__'
        read_only_fields = ['timestamp']

class SiteConfigurationSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteConfiguration
        fields = '__all__'
        read_only_fields = ['updated_at']