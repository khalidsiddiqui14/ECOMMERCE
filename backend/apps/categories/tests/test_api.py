from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from apps.categories.models import Category

User = get_user_model()


class CategoryAPITestCase(APITestCase):

    # Create test users and categories
    def setUp(self):
        self.customer = User.objects.create_user(
            username="customer",
            email="customer@example.com",
            password="TestPassword123!",
            role="CUSTOMER",
        )

        self.admin = User.objects.create_user(
            username="admin",
            email="admin@example.com",
            password="TestPassword123!",
            role="ADMIN",
        )

        self.active_category = Category.objects.create(
            name="Electronics",
            slug="electronics",
            description="Electronic products",
            is_active=True,
        )

        self.inactive_category = Category.objects.create(
            name="Old Products",
            slug="old-products",
            description="Inactive category",
            is_active=False,
        )

    # Test public category listing
    def test_public_can_list_active_categories(self):
        response = self.client.get("/api/categories/")

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["count"],
            1,
        )

        self.assertEqual(
            response.data["results"][0]["name"],
            "Electronics",
        )

    # Test admin can list all categories
    def test_admin_can_list_all_categories(self):
        self.client.force_authenticate(
            user=self.admin,
        )

        response = self.client.get("/api/categories/")

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["count"],
            2,
        )

    # Test admin can create a category
    def test_admin_can_create_category(self):
        self.client.force_authenticate(
            user=self.admin,
        )

        response = self.client.post(
            "/api/categories/",
            {
                "name": "Fashion",
                "slug": "fashion",
                "description": "Fashion products",
                "is_active": True,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertTrue(
            Category.objects.filter(
                slug="fashion",
            ).exists()
        )

    # Test customer cannot create a category
    def test_customer_cannot_create_category(self):
        self.client.force_authenticate(
            user=self.customer,
        )

        response = self.client.post(
            "/api/categories/",
            {
                "name": "Fashion",
                "slug": "fashion",
                "description": "Fashion products",
                "is_active": True,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    # Test unauthenticated user cannot create a category
def test_unauthenticated_user_cannot_create_category(self):
    response = self.client.post(
        "/api/categories/",
        {
            "name": "Fashion",
            "slug": "fashion",
            "description": "Fashion products",
            "is_active": True,
        },
        format="json",
    )

    self.assertEqual(
        response.status_code,
        status.HTTP_401_UNAUTHORIZED,
    )

    # Test admin can update a category
    def test_admin_can_update_category(self):
        self.client.force_authenticate(
            user=self.admin,
        )

        response = self.client.patch(
            f"/api/categories/{self.active_category.id}/",
            {
                "name": "Updated Electronics",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.active_category.refresh_from_db()

        self.assertEqual(
            self.active_category.name,
            "Updated Electronics",
        )

    # Test customer cannot update a category
    def test_customer_cannot_update_category(self):
        self.client.force_authenticate(
            user=self.customer,
        )

        response = self.client.patch(
            f"/api/categories/{self.active_category.id}/",
            {
                "name": "Hacked Category",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    # Test admin can delete a category
    def test_admin_can_delete_category(self):
        self.client.force_authenticate(
            user=self.admin,
        )

        response = self.client.delete(
            f"/api/categories/{self.active_category.id}/",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_204_NO_CONTENT,
        )

        self.assertFalse(
            Category.objects.filter(
                id=self.active_category.id,
            ).exists()
        )

    # Test category name validation
    def test_category_name_must_have_three_characters(self):
        self.client.force_authenticate(
            user=self.admin,
        )

        response = self.client.post(
            "/api/categories/",
            {
                "name": "AB",
                "slug": "ab",
                "description": "Invalid category",
                "is_active": True,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    # Test duplicate category name is rejected
    def test_duplicate_category_name_is_rejected(self):
        self.client.force_authenticate(
            user=self.admin,
        )

        response = self.client.post(
            "/api/categories/",
            {
                "name": "Electronics",
                "slug": "electronics-new",
                "description": "Duplicate category",
                "is_active": True,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    # Test duplicate category slug is rejected
    def test_duplicate_category_slug_is_rejected(self):
        self.client.force_authenticate(
            user=self.admin,
        )

        response = self.client.post(
            "/api/categories/",
            {
                "name": "New Electronics",
                "slug": "electronics",
                "description": "Duplicate slug",
                "is_active": True,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )