from django.db import models
from django.contrib.auth.models import AbstractUser
from datetime import timedelta
from django.utils import timezone
import random

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

class OTP(models.Model):
    email_or_phone = models.CharField(
        max_length=100,
        db_index=True,
    )

    otp_code = models.CharField(
        max_length=6,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    is_verified = models.BooleanField(
        default=False,
    )
    
    # --- SECURITY ADD KIYA - YE 2 LINE ADD KAR ---
    is_used = models.BooleanField(default=False)
    attempts = models.IntegerField(default=0)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "OTP"
        verbose_name_plural = "OTPs"

    def __str__(self):
        return f"{self.email_or_phone} - {self.otp_code}"

    def is_expired(self):
        return timezone.now() > self.created_at + timedelta(minutes=5)

    @staticmethod
    def generate_otp():
        return str(random.randint(100000, 999999))