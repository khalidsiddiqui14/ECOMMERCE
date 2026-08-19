from django.core.validators import MinValueValidator
from django.db import models

from apps.categories.models import Category
from apps.brands.models import Brand
from apps.stores.models import Store


class Product(models.Model):
    STATUS_CHOICES = (
        ("DRAFT", "Draft"),
        ("PUBLISHED", "Published"),
        ("OUT_OF_STOCK", "Out of Stock"),
    )

    # Link product to its store
    store = models.ForeignKey(
        Store,
        on_delete=models.CASCADE,
        related_name="products",
    )

    # Link product to its category
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name="products",
    )

    # Link product to an optional brand
    brand = models.ForeignKey(
        Brand,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="products",
    )

    # Store the product name
    name = models.CharField(
        max_length=255,
        db_index=True,
    )

    # Store the unique URL-friendly product identifier
    slug = models.SlugField(
        max_length=255,
        unique=True,
    )

    # Store the unique product SKU
    sku = models.CharField(
        max_length=100,
        unique=True,
        db_index=True,
    )

    # Store the product description
    description = models.TextField()

    # Store the product price
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[
            MinValueValidator(0),
        ],
    )

    # Store the available product stock
    stock = models.PositiveIntegerField(
        default=0,
    )

    # Track the product publication status
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="DRAFT",
        db_index=True,
    )

    # Track whether the product is active
    is_active = models.BooleanField(
        default=True,
        db_index=True,
    )

    # Store the product creation timestamp
    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    # Store the product last update timestamp
    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Product"
        verbose_name_plural = "Products"

    def __str__(self):
        return self.name


class ProductImage(models.Model):
    # Link the image to a product
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="images",
    )

    # Store the product image
    image = models.ImageField(
        upload_to="products/%Y/%m/",
    )

    # Mark the primary product image
    is_primary = models.BooleanField(
        default=False,
        db_index=True,
    )

    # Store the image creation timestamp
    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        ordering = ["id"]
        verbose_name = "Product Image"
        verbose_name_plural = "Product Images"

        constraints = [
            models.UniqueConstraint(
                fields=["product"],
                condition=models.Q(is_primary=True),
                name="unique_primary_image_per_product",
            ),
        ]

    def __str__(self):
        return f"{self.product.name} Image"