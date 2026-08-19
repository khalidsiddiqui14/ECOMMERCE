from django.conf import settings
from django.db import models


class Vendor(models.Model):
    # Link vendor profile to a user account
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="vendor",
    )

    # Store the vendor business name
    business_name = models.CharField(
        max_length=255,
    )

    # Store the vendor contact phone number
    phone = models.CharField(
        max_length=15,
        unique=True,
    )

    # Store the optional GST registration number
    gst_number = models.CharField(
        max_length=30,
        unique=True,
        blank=True,
        null=True,
    )

    # Store the vendor business address
    address = models.TextField()

    # Store the vendor city
    city = models.CharField(
        max_length=100,
    )

    # Store the vendor state
    state = models.CharField(
        max_length=100,
    )

    # Store the vendor country
    country = models.CharField(
        max_length=100,
    )

    # Store the vendor postal code
    postal_code = models.CharField(
        max_length=20,
    )

    # Track whether the vendor has been verified
    is_verified = models.BooleanField(
        default=False,
        db_index=True,
    )

    # Track whether the vendor account is active
    is_active = models.BooleanField(
        default=True,
        db_index=True,
    )

    # Store the vendor creation timestamp
    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    # Store the vendor last update timestamp
    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Vendor"
        verbose_name_plural = "Vendors"

    def __str__(self):
        return self.business_name