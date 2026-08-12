from django.db import models
from django.contrib.auth.models import AbstractUser

from .managers import UserManager


class User(AbstractUser):
    ROLE_CHOICES = (
        ("ADMIN", "Admin"),
        ("VENDOR", "Vendor"),
        ("CUSTOMER", "Customer"),
    )

    email = models.EmailField(
        unique=True,
    )

    phone = models.CharField(
        max_length=15,
        unique=True,
        blank=True,
        null=True,
    )

    profile_image = models.ImageField(
        upload_to="profiles/%Y/%m/",
        blank=True,
        null=True,
    )

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default="CUSTOMER",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    objects = UserManager()

    class Meta:
        ordering = ["id"]
        verbose_name = "User"
        verbose_name_plural = "Users"

    def __str__(self):
        return self.email