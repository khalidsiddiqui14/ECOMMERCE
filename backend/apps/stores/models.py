from django.db import models

from apps.vendors.models import Vendor


class Store(models.Model):
    vendor = models.OneToOneField(
        Vendor,
        on_delete=models.CASCADE,
        related_name="store",
    )

    name = models.CharField(
        max_length=255,
        db_index=True,
    )

    slug = models.SlugField(
        unique=True,
    )

    logo = models.ImageField(
        upload_to="stores/logos/%Y/%m/",
        blank=True,
        null=True,
    )

    banner = models.ImageField(
        upload_to="stores/banners/%Y/%m/",
        blank=True,
        null=True,
    )

    description = models.TextField(
        blank=True,
    )

    email = models.EmailField(
        blank=True,
    )

    phone = models.CharField(
        max_length=20,
        blank=True,
    )

    address = models.TextField()

    city = models.CharField(
        max_length=100,
    )

    state = models.CharField(
        max_length=100,
    )

    country = models.CharField(
        max_length=100,
    )

    postal_code = models.CharField(
        max_length=20,
    )

    is_active = models.BooleanField(
        default=True,
        db_index=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Store"
        verbose_name_plural = "Stores"

    def __str__(self):
        return self.name