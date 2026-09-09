from django.db import models
from django.conf import settings
from django.utils import timezone

class AdminActivityLog(models.Model):
    """
    Keeps a record of what admin did - for security and tracking.
    This is very important for any Ecommerce Admin Panel.
    """
    ACTION_CHOICES = [
        ('CREATE', 'Create'),
        ('UPDATE', 'Update'),
        ('DELETE', 'Delete'),
        ('STATUS_CHANGE', 'Status Change'),
        ('LOGIN', 'Login'),
    ]

    admin_user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True,
        related_name='admin_logs'
    )
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    model_name = models.CharField(max_length=100, help_text="e.g., Product, Order, User")
    object_id = models.CharField(max_length=100, null=True, blank=True)
    description = models.TextField(blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-timestamp']
        verbose_name = "Admin Activity Log"
        verbose_name_plural = "Admin Activity Logs"

    def __str__(self):
        return f"{self.admin_user} - {self.action} - {self.model_name} at {self.timestamp}"

class SiteConfiguration(models.Model):
    """
    For storing site-wide settings that admin can change.
    e.g., site name, maintenance mode, banner text.
    """
    key = models.CharField(max_length=100, unique=True)
    value = models.TextField()
    description = models.CharField(max_length=255, blank=True)
    is_active = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Site Configuration"
        verbose_name_plural = "Site Configurations"

    def __str__(self):
        return f"{self.key}: {self.value[:30]}"