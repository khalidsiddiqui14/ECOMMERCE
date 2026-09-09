from django.contrib import admin
from .models import AdminActivityLog, SiteConfiguration

@admin.register(AdminActivityLog)
class AdminActivityLogAdmin(admin.ModelAdmin):
    list_display = ('admin_user', 'action', 'model_name', 'object_id', 'ip_address', 'timestamp')
    list_filter = ('action', 'model_name', 'timestamp')
    search_fields = ('admin_user__email', 'model_name', 'description')
    readonly_fields = ('admin_user', 'action', 'model_name', 'object_id', 'description', 'ip_address', 'timestamp')
    ordering = ('-timestamp',)

    def has_add_permission(self, request):
        # Logs should only be created automatically, not manually
        return False

    def has_change_permission(self, request, obj=None):
        # Logs should not be editable
        return False


@admin.register(SiteConfiguration)
class SiteConfigurationAdmin(admin.ModelAdmin):
    list_display = ('key', 'value_summary', 'is_active', 'updated_at')
    list_filter = ('is_active',)
    search_fields = ('key', 'description')
    list_editable = ('is_active',)

    def value_summary(self, obj):
        return obj.value[:50] + "..." if len(obj.value) > 50 else obj.value
    value_summary.short_description = "Value"