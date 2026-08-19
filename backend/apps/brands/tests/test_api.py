from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from apps.brands.models import Brand


User = get_user_model()


class BrandAPITestCase(APITestCase):

    # Create test users and brands
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

        self.active_brand = Brand.objects.create(
            name="Samsung",
            slug="samsung",
            description="Electronic brand",
            is_active=True,
        )

        self.inactive_brand = Brand.objects.create(
            name="Old Brand",
            slug="old-brand",
            description="Inactive brand",
            is_active=False,
        )

    # Test public users can list active brands
    def test_public_can_list_active_brands(self):
        response = self.client.get("/api/brands/")

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
            "Samsung",
        )

    # Test admin can list all brands
    def test_admin_can_list_all_brands(self):
        self.client.force_authenticate(
            user=self.admin,
        )

        response = self.client.get("/api/brands/")

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["count"],
            2,
        )

    # Test admin can create a brand
    def test_admin_can_create_brand(self):
        self.client.force_authenticate(
            user=self.admin,
        )

        response = self.client.post(
            "/api/brands/",
            {
                "name": "Apple",
                "slug": "apple",
                "description": "Technology brand",
                "is_active": True,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertTrue(
            Brand.objects.filter(
                slug="apple",
            ).exists()
        )

    # Test customer cannot create a brand
    def test_customer_cannot_create_brand(self):
        self.client.force_authenticate(
            user=self.customer,
        )

        response = self.client.post(
            "/api/brands/",
            {
                "name": "Apple",
                "slug": "apple",
                "description": "Technology brand",
                "is_active": True,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    # Test unauthenticated users cannot create a brand
    def test_unauthenticated_user_cannot_create_brand(self):
        response = self.client.post(
            "/api/brands/",
            {
                "name": "Apple",
                "slug": "apple",
                "description": "Technology brand",
                "is_active": True,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    # Test admin can update a brand
    def test_admin_can_update_brand(self):
        self.client.force_authenticate(
            user=self.admin,
        )

        response = self.client.patch(
            f"/api/brands/{self.active_brand.id}/",
            {
                "name": "Samsung Electronics",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.active_brand.refresh_from_db()

        self.assertEqual(
            self.active_brand.name,
            "Samsung Electronics",
        )

    # Test customer cannot update a brand
    def test_customer_cannot_update_brand(self):
        self.client.force_authenticate(
            user=self.customer,
        )

        response = self.client.patch(
            f"/api/brands/{self.active_brand.id}/",
            {
                "name": "Hacked Brand",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    # Test admin can delete a brand
    def test_admin_can_delete_brand(self):
        self.client.force_authenticate(
            user=self.admin,
        )

        response = self.client.delete(
            f"/api/brands/{self.active_brand.id}/",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_204_NO_CONTENT,
        )

        self.assertFalse(
            Brand.objects.filter(
                id=self.active_brand.id,
            ).exists()
        )

    # Test brand name validation
    def test_brand_name_requires_two_characters(self):
        self.client.force_authenticate(
            user=self.admin,
        )

        response = self.client.post(
            "/api/brands/",
            {
                "name": "A",
                "slug": "a",
                "description": "Invalid brand",
                "is_active": True,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    # Test duplicate brand name is rejected
    def test_duplicate_brand_name_is_rejected(self):
        self.client.force_authenticate(
            user=self.admin,
        )

        response = self.client.post(
            "/api/brands/",
            {
                "name": "Samsung",
                "slug": "samsung-new",
                "description": "Duplicate brand",
                "is_active": True,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    # Test duplicate brand slug is rejected
    def test_duplicate_brand_slug_is_rejected(self):
        self.client.force_authenticate(
            user=self.admin,
        )

        response = self.client.post(
            "/api/brands/",
            {
                "name": "New Samsung",
                "slug": "samsung",
                "description": "Duplicate slug",
                "is_active": True,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )