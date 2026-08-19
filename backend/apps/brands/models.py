from django.db import models


class Brand(models.Model):
    # Store the unique brand name
    name = models.CharField(
        max_length=255,
        unique=True,
        db_index=True,
    )

    # Store the unique URL-friendly brand identifier
    slug = models.SlugField(
        max_length=255,
        unique=True,
    )

    # Store the optional brand logo
    logo = models.ImageField(
        upload_to="brands/%Y/%m/",
        blank=True,
        null=True,
    )

    # Store the optional brand description
    description = models.TextField(
        blank=True,
    )

    # Track whether the brand is active
    is_active = models.BooleanField(
        default=True,
        db_index=True,
    )

    # Store the brand creation timestamp
    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    # Store the brand last update timestamp
    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["name"]
        verbose_name = "Brand"
        verbose_name_plural = "Brands"

    def __str__(self):
        return self.name