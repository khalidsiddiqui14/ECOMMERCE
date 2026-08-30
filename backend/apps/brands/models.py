from django.db import models
from django.utils.text import slugify


class Brand(models.Model):
    name = models.CharField(
        max_length=255,
        unique=True,
        db_index=True,
    )

    slug = models.SlugField(
        max_length=255,
        unique=True,
    )

    logo = models.ImageField(
        upload_to="brands/%Y/%m/",
        blank=True,
        null=True,
    )

    description = models.TextField(
        blank=True,
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
        ordering = ["name"]
        verbose_name = "Brand"
        verbose_name_plural = "Brands"

    def save(self, *args, **kwargs):
        self.name = self.name.strip()

        if not self.slug:
            self.slug = slugify(self.name)

        super().save(*args, **kwargs)

    def __str__(self):
        return self.name