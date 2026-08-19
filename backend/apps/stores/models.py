from django.db import models

from apps.vendors.models import Vendor


class Store(models.Model):
    # Link each store to one vendor
    vendor = models.OneToOneField(
        Vendor,
        on_delete=models.CASCADE,
        related_name="store",
    )

    # Store the business display name
    name = models.CharField(
        max_length=255,
        db_index=True,
    )

    # Store the unique URL-friendly store identifier
    slug = models.SlugField(
        max_length=255,
        unique=True,
    )

    # Store the store logo
    logo = models.ImageField(
        upload_to="stores/logos/%Y/%m/",
        blank=True,
        null=True,
    )

    # Store the store banner
    banner = models.ImageField(
        upload_to="stores/banners/%Y/%m/",
        blank=True,
        null=True,
    )

    # Store the store description
    description = models.TextField(
        blank=True,
    )

    # Store the store contact email
    email = models.EmailField(
        blank=True,
    )

    # Store the store contact phone
    phone = models.CharField(
        max_length=20,
        blank=True,
    )

    # Store the business address
    address = models.TextField()

    # Store the business city
    city = models.CharField(
        max_length=100,
    )

    # Store the business state
    state = models.CharField(
        max_length=100,
    )

    # Store the business country
    country = models.CharField(
        max_length=100,
    )

    # Store the business postal code
    postal_code = models.CharField(
        max_length=20,
    )

    # Track whether the store is active
    is_active = models.BooleanField(
        default=True,
        db_index=True,
    )

    # Store the creation timestamp
    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    # Store the last update timestamp
    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Store"
        verbose_name_plural = "Stores"

    def __str__(self):
        return self.name