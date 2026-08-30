from django.contrib.auth import get_user_model

from rest_framework import status
from rest_framework.test import APITestCase

from apps.categories.models import Category
from apps.orders.models import Order, OrderItem
from apps.products.models import Product
from apps.reviews.models import Review
from apps.stores.models import Store
from apps.vendors.models import Vendor


User = get_user_model()


class ReviewAPITestCase(APITestCase):

    # Create users, vendor, store, product and delivered order.
    def setUp(self):
        self.user = User.objects.create_user(
            username="reviewuser",
            email="reviewuser@example.com",
            password="TestPass123!",
            role="CUSTOMER",
        )

        self.other_user = User.objects.create_user(
            username="otheruser",
            email="otheruser@example.com",
            password="TestPass123!",
            role="CUSTOMER",
        )

        self.admin = User.objects.create_user(
            username="reviewadmin",
            email="reviewadmin@example.com",
            password="TestPass123!",
            role="ADMIN",
        )

        self.vendor_user = User.objects.create_user(
            username="reviewvendor",
            email="reviewvendor@example.com",
            password="TestPass123!",
            role="VENDOR",
        )

        self.vendor = Vendor.objects.create(
            user=self.vendor_user,
            business_name="Test Vendor",
            phone="9000000001",
            address="Vendor Address",
            city="Delhi",
            state="Delhi",
            country="India",
            postal_code="110001",
        )

        self.category = Category.objects.create(
            name="Test Category",
            slug="test-category",
            is_active=True,
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
            is_active=True,
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

        self.order = Order.objects.create(
            user=self.user,
            order_number="ORD-REVIEW-001",
            status="DELIVERED",
            payment_status="PAID",
            subtotal="999.00",
            discount_amount="0.00",
            shipping_cost="0.00",
            total_amount="999.00",
            shipping_name="Review User",
            shipping_phone="9000000010",
            shipping_address="Test Address",
            shipping_city="Delhi",
            shipping_state="Delhi",
            shipping_country="India",
            shipping_postal_code="110001",
        )

        self.order_item = OrderItem.objects.create(
            order=self.order,
            product=self.product,
            product_name=self.product.name,
            sku=self.product.sku,
            price=self.product.price,
            quantity=1,
        )

        self.review = Review.objects.create(
            user=self.user,
            product=self.product,
            rating=5,
            comment="Excellent product.",
        )

        self.list_url = "/api/reviews/"

    # Test review exists.
    def test_review_exists(self):
        self.assertEqual(
            Review.objects.count(),
            1,
        )

    # Test review rating.
    def test_review_rating(self):
        self.assertEqual(
            self.review.rating,
            5,
        )

    # Test review product.
    def test_review_product(self):
        self.assertEqual(
            self.review.product,
            self.product,
        )

    # Test review user.
    def test_review_user(self):
        self.assertEqual(
            self.review.user,
            self.user,
        )

    # Test review comment.
    def test_review_comment(self):
        self.assertEqual(
            self.review.comment,
            "Excellent product.",
        )

    # Test review is active.
    def test_review_is_active(self):
        self.assertTrue(
            self.review.is_active,
        )

    # Test review string.
    def test_review_string(self):
        self.assertEqual(
            str(self.review),
            "Test Product - 5/5",
        )

    # Test public users can list active reviews.
    def test_public_can_list_reviews(self):
        response = self.client.get(
            self.list_url,
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["count"],
            1,
        )

    # Test reviews can be filtered by product.
    def test_reviews_can_be_filtered_by_product(self):
        response = self.client.get(
            f"{self.list_url}?product={self.product.id}",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["count"],
            1,
        )

    # Test user can retrieve active review.
    def test_user_can_retrieve_review(self):
        response = self.client.get(
            f"{self.list_url}{self.review.id}/",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["id"],
            self.review.id,
        )

    # Test unauthenticated user cannot create review.
    def test_unauthenticated_user_cannot_create_review(self):
        response = self.client.post(
            self.list_url,
            {
                "product": self.product.id,
                "rating": 5,
                "comment": "Great product.",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    # Test user cannot create duplicate review.
    def test_user_cannot_create_duplicate_review(self):
        self.client.force_authenticate(
            user=self.user,
        )

        response = self.client.post(
            self.list_url,
            {
                "product": self.product.id,
                "rating": 4,
                "comment": "Another review.",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertIn(
            "already reviewed",
            str(response.data),
        )

    # Test user must receive product before reviewing.
    def test_user_cannot_review_without_delivered_order(self):
        new_user = User.objects.create_user(
            username="newreviewuser",
            email="newreviewuser@example.com",
            password="TestPass123!",
            role="CUSTOMER",
        )

        self.client.force_authenticate(
            user=new_user,
        )

        response = self.client.post(
            self.list_url,
            {
                "product": self.product.id,
                "rating": 5,
                "comment": "Great product.",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertIn(
            "purchasing and receiving",
            str(response.data),
        )

    # Test delivered customer can create review.
    def test_delivered_customer_can_create_review(self):
        Review.objects.filter(
            id=self.review.id,
        ).delete()

        self.client.force_authenticate(
            user=self.user,
        )

        response = self.client.post(
            self.list_url,
            {
                "product": self.product.id,
                "rating": 4,
                "comment": "Good product.",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        review = Review.objects.get(
            user=self.user,
            product=self.product,
        )

        self.assertTrue(
            review.is_verified_purchase,
        )

    # Test inactive product cannot be reviewed.
    def test_inactive_product_cannot_be_reviewed(self):
        Review.objects.filter(
            id=self.review.id,
        ).delete()

        self.product.is_active = False
        self.product.save(
            update_fields=[
                "is_active",
            ]
        )

        self.client.force_authenticate(
            user=self.user,
        )

        response = self.client.post(
            self.list_url,
            {
                "product": self.product.id,
                "rating": 5,
                "comment": "Great product.",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    # Test user can update own review.
    def test_user_can_update_own_review(self):
        self.client.force_authenticate(
            user=self.user,
        )

        response = self.client.patch(
            f"{self.list_url}{self.review.id}/",
            {
                "rating": 4,
                "comment": "Updated review.",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.review.refresh_from_db()

        self.assertEqual(
            self.review.rating,
            4,
        )

        self.assertEqual(
            self.review.comment,
            "Updated review.",
        )

        self.assertFalse(
            self.review.is_verified_purchase,
        )

    # Test user cannot update another user's review.
    def test_user_cannot_update_other_users_review(self):
        other_review = Review.objects.create(
            user=self.other_user,
            product=self.product,
            rating=3,
            comment="Other review.",
        )

        self.client.force_authenticate(
            user=self.user,
        )

        response = self.client.patch(
            f"{self.list_url}{other_review.id}/",
            {
                "rating": 1,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    # Test user can delete own review.
    def test_user_can_delete_own_review(self):
        self.client.force_authenticate(
            user=self.user,
        )

        response = self.client.delete(
            f"{self.list_url}{self.review.id}/",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_204_NO_CONTENT,
        )

        self.assertFalse(
            Review.objects.filter(
                id=self.review.id,
            ).exists()
        )

    # Test user cannot delete another user's review.
    def test_user_cannot_delete_other_users_review(self):
        other_review = Review.objects.create(
            user=self.other_user,
            product=self.product,
            rating=3,
            comment="Other review.",
        )

        self.client.force_authenticate(
            user=self.user,
        )

        response = self.client.delete(
            f"{self.list_url}{other_review.id}/",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

        self.assertTrue(
            Review.objects.filter(
                id=other_review.id,
            ).exists()
        )

    # Test unauthenticated user cannot update review.
    def test_unauthenticated_user_cannot_update_review(self):
        response = self.client.patch(
            f"{self.list_url}{self.review.id}/",
            {
                "rating": 3,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    # Test admin can update any review.
    def test_admin_can_update_review(self):
        self.client.force_authenticate(
            user=self.admin,
        )

        response = self.client.patch(
            f"{self.list_url}{self.review.id}/",
            {
                "rating": 3,
                "is_active": False,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.review.refresh_from_db()

        self.assertEqual(
            self.review.rating,
            3,
        )

        self.assertFalse(
            self.review.is_active,
        )

    # Test admin can delete any review.
    def test_admin_can_delete_review(self):
        self.client.force_authenticate(
            user=self.admin,
        )

        response = self.client.delete(
            f"{self.list_url}{self.review.id}/",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_204_NO_CONTENT,
        )

        self.assertFalse(
            Review.objects.filter(
                id=self.review.id,
            ).exists()
        )

    # Test inactive reviews are hidden from public list.
    def test_inactive_review_is_hidden_from_public_list(self):
        self.review.is_active = False
        self.review.save(
            update_fields=[
                "is_active",
            ]
        )

        response = self.client.get(
            self.list_url,
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["count"],
            0,
        )

    # Test product rating endpoint.
    def test_product_rating_endpoint(self):
        Review.objects.create(
            user=self.other_user,
            product=self.product,
            rating=3,
            comment="Average product.",
        )

        response = self.client.get(
            f"/api/reviews/product/"
            f"{self.product.id}/rating/",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["product"],
            self.product.id,
        )

        self.assertEqual(
            response.data["total_reviews"],
            2,
        )

        self.assertEqual(
            response.data["average_rating"],
            4.0,
        )

    # Test inactive reviews are excluded from rating.
    def test_inactive_reviews_are_excluded_from_rating(self):
        self.review.is_active = False
        self.review.save(
            update_fields=[
                "is_active",
            ]
        )

        response = self.client.get(
            f"/api/reviews/product/"
            f"{self.product.id}/rating/",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["total_reviews"],
            0,
        )

        self.assertEqual(
            response.data["average_rating"],
            0,
        )

    # Test invalid rating is rejected.
    def test_invalid_rating_is_rejected(self):
        Review.objects.filter(
            id=self.review.id,
        ).delete()

        self.client.force_authenticate(
            user=self.user,
        )

        response = self.client.post(
            self.list_url,
            {
                "product": self.product.id,
                "rating": 6,
                "comment": "Invalid rating.",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    # Test comment is normalized.
    def test_comment_is_trimmed(self):
        Review.objects.filter(
            id=self.review.id,
        ).delete()

        self.client.force_authenticate(
            user=self.user,
        )

        response = self.client.post(
            self.list_url,
            {
                "product": self.product.id,
                "rating": 5,
                "comment": "  Great product.  ",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        review = Review.objects.get(
            user=self.user,
            product=self.product,
        )

        self.assertEqual(
            review.comment,
            "Great product.",
        )