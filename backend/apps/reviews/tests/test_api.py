from django.contrib.auth import get_user_model

from rest_framework import status
from rest_framework.test import APITestCase

from apps.categories.models import Category
from apps.products.models import Product
from apps.reviews.models import Review
from apps.stores.models import Store
from apps.vendors.models import Vendor


User = get_user_model()


class ReviewAPITestCase(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="reviewuser",
            email="reviewuser@example.com",
            password="TestPass123!",
        )

        self.other_user = User.objects.create_user(
            username="otheruser",
            email="otheruser@example.com",
            password="TestPass123!",
        )

        self.vendor = Vendor.objects.create(
            user=self.user,
            # YAHAN vendors/tests.py ke exact required fields rakho.
        )

        self.category = Category.objects.create(
            name="Test Category",
            slug="test-category",
        )

        self.store = Store.objects.create(
            vendor=self.vendor,
            name="Test Store",
            slug="test-store",
            address="Test Address",
            city="Delhi",
            state="Delhi",
            country="India",
            postal_code="110001",
        )

        self.product = Product.objects.create(
            store=self.store,
            category=self.category,
            name="Test Product",
            slug="test-product",
            sku="TEST-SKU-001",
            description="Test product description.",
            price="999.00",
            stock=10,
            status="PUBLISHED",
            is_active=True,
        )

        self.review = Review.objects.create(
            user=self.user,
            product=self.product,
            rating=5,
            comment="Excellent product.",
        )

    def test_review_exists(self):
        self.assertEqual(
            Review.objects.count(),
            1,
        )

    def test_review_rating(self):
        self.assertEqual(
            self.review.rating,
            5,
        )

    def test_review_product(self):
        self.assertEqual(
            self.review.product,
            self.product,
        )

    def test_review_user(self):
        self.assertEqual(
            self.review.user,
            self.user,
        )

    def test_review_comment(self):
        self.assertEqual(
            self.review.comment,
            "Excellent product.",
        )

    def test_review_is_active(self):
        self.assertTrue(
            self.review.is_active,
        )

    def test_review_string(self):
        self.assertEqual(
            str(self.review),
            "Test Product - 5/5",
        )