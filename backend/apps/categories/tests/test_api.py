from django.contrib.auth import get_user_model

from rest_framework import status
from rest_framework.test import APITestCase

from apps.categories.models import Category


User = get_user_model()


class CategoryAPITestCase(APITestCase):
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

    def authenticate_customer(self):
        self.client.force_authenticate(
            user=self.customer,
        )

    def authenticate_admin(self):
        self.client.force_authenticate(
            user=self.admin,
        )

    def test_public_can_list_active_categories(self):
        response = self.client.get(
            "/api/categories/",
        )

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

    def test_public_can_retrieve_active_category(self):
        response = self.client.get(
            f"/api/categories/{self.active_category.id}/",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["name"],
            "Electronics",
        )

    def test_public_cannot_retrieve_inactive_category(self):
        response = self.client.get(
            f"/api/categories/{self.inactive_category.id}/",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

    def test_admin_can_list_all_categories(self):
        self.authenticate_admin()

        response = self.client.get(
            "/api/categories/",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["count"],
            2,
        )

    def test_admin_can_retrieve_inactive_category(self):
        self.authenticate_admin()

        response = self.client.get(
            f"/api/categories/{self.inactive_category.id}/",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["name"],
            "Old Products",
        )

    def test_admin_can_create_category(self):
        self.authenticate_admin()

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

    def test_customer_cannot_create_category(self):
        self.authenticate_customer()

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

    def test_admin_can_update_category(self):
        self.authenticate_admin()

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

    def test_customer_cannot_update_category(self):
        self.authenticate_customer()

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

    def test_admin_can_delete_category(self):
        self.authenticate_admin()

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

    def test_customer_cannot_delete_category(self):
        self.authenticate_customer()

        response = self.client.delete(
            f"/api/categories/{self.active_category.id}/",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

        self.assertTrue(
            Category.objects.filter(
                id=self.active_category.id,
            ).exists()
        )

    def test_category_name_must_have_three_characters(self):
        self.authenticate_admin()

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

    def test_category_slug_must_have_three_characters(self):
        self.authenticate_admin()

        response = self.client.post(
            "/api/categories/",
            {
                "name": "ABC",
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

    def test_duplicate_category_name_is_rejected(self):
        self.authenticate_admin()

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

    def test_duplicate_category_slug_is_rejected(self):
        self.authenticate_admin()

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

    def test_category_name_is_trimmed(self):
        self.authenticate_admin()

        response = self.client.post(
            "/api/categories/",
            {
                "name": "  Fashion  ",
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

        category = Category.objects.get(
            slug="fashion",
        )

        self.assertEqual(
            category.name,
            "Fashion",
        )

    def test_category_slug_is_normalized(self):
        self.authenticate_admin()

        response = self.client.post(
            "/api/categories/",
            {
                "name": "Mobiles",
                "slug": "  MOBILES  ",
                "description": "Mobile products",
                "is_active": True,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        category = Category.objects.get(
            name="Mobiles",
        )

        self.assertEqual(
            category.slug,
            "mobiles",
        )

    def test_category_description_is_trimmed(self):
        self.authenticate_admin()

        response = self.client.post(
            "/api/categories/",
            {
                "name": "Furniture",
                "slug": "furniture",
                "description": "  Furniture products  ",
                "is_active": True,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        category = Category.objects.get(
            slug="furniture",
        )

        self.assertEqual(
            category.description,
            "Furniture products",
        )