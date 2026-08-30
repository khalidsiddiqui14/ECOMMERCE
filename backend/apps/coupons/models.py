from decimal import Decimal

from django.core.validators import MinValueValidator
from django.db import models
from django.utils import timezone


class Coupon(models.Model):
    DISCOUNT_TYPE_CHOICES = (
        ("PERCENTAGE", "Percentage"),
        ("FIXED", "Fixed Amount"),
    )

    code = models.CharField(
        max_length=50,
        unique=True,
        db_index=True,
    )

    discount_type = models.CharField(
        max_length=20,
        choices=DISCOUNT_TYPE_CHOICES,
    )

    discount_value = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[
            MinValueValidator(Decimal("0.01")),
        ],
    )

    minimum_order_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[
            MinValueValidator(Decimal("0.00")),
        ],
    )

    maximum_discount_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        blank=True,
        null=True,
        validators=[
            MinValueValidator(Decimal("0.00")),
        ],
    )

    usage_limit = models.PositiveIntegerField(
        blank=True,
        null=True,
    )

    used_count = models.PositiveIntegerField(
        default=0,
    )

    per_user_limit = models.PositiveIntegerField(
        default=1,
    )

    start_date = models.DateTimeField(
        default=timezone.now,
    )

    end_date = models.DateTimeField()

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
        verbose_name = "Coupon"
        verbose_name_plural = "Coupons"

        indexes = [
            models.Index(
                fields=[
                    "code",
                    "is_active",
                ],
                name="coupon_code_active_idx",
            ),
            models.Index(
                fields=[
                    "start_date",
                    "end_date",
                ],
                name="coupon_date_range_idx",
            ),
        ]

    def __str__(self):
        return self.code

    @property
    def is_expired(self):
        return timezone.now() > self.end_date

    @property
    def is_started(self):
        return timezone.now() >= self.start_date

    @property
    def is_usage_limit_reached(self):
        if self.usage_limit is None:
            return False

        return self.used_count >= self.usage_limit

    @property
    def is_valid(self):
        now = timezone.now()

        if not self.is_active:
            return False

        if now < self.start_date:
            return False

        if now > self.end_date:
            return False

        if self.usage_limit is not None:
            if self.used_count >= self.usage_limit:
                return False

        return True

    def calculate_discount(self, order_amount):
        order_amount = Decimal(str(order_amount))

        if order_amount < self.minimum_order_amount:
            return Decimal("0.00")

        if self.discount_type == "PERCENTAGE":
            discount = (
                order_amount * self.discount_value
            ) / Decimal("100")
        else:
            discount = self.discount_value

        if self.maximum_discount_amount is not None:
            discount = min(
                discount,
                self.maximum_discount_amount,
            )

        discount = min(
            discount,
            order_amount,
        )

        return discount.quantize(
            Decimal("0.01")
        )