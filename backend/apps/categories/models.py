from django.db import models


class Category(models.Model):
    # Store the unique category name
    name = models.CharField(
        max_length=255,
        unique=True,
        db_index=True,
    )

    # Store the unique URL-friendly category identifier
    slug = models.SlugField(
        max_length=255,
        unique=True,
    )

    # Store the optional category description
    description = models.TextField(
        blank=True,
    )

    # Store the optional category image
    image = models.ImageField(
        upload_to="categories/%Y/%m/",
        blank=True,
        null=True,
    )

    # Track whether the category is active
    is_active = models.BooleanField(
        default=True,
        db_index=True,
    )

    # Store the category creation timestamp
    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    # Store the category last update timestamp
    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["name"]
        verbose_name = "Category"
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name