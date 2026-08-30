from django.contrib.auth import get_user_model

from rest_framework import status
from rest_framework.test import APITestCase

from apps.brands.models import Brand


User = get_user_model()


class BrandAPITestCase(APITestCase):
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

    def authenticate_admin(self):
        self.client.force_authenticate(
            user=self.admin,
        )

    def authenticate_customer(self):
        self.client.force_authenticate(
            user=self.customer,
        )

    def test_public_can_list_active_brands(self):
        response = self.client.get(
            "/api/brands/"
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
            "Samsung",
        )

    def test_public_can_retrieve_active_brand(self):
        response = self.client.get(
            f"/api/brands/{self.active_brand.id}/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["name"],
            "Samsung",
        )

    def test_public_cannot_retrieve_inactive_brand(self):
        response = self.client.get(
            f"/api/brands/{self.inactive_brand.id}/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

    def test_admin_can_list_all_brands(self):
        self.authenticate_admin()

        response = self.client.get(
            "/api/brands/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["count"],
            2,
        )

    def test_admin_can_retrieve_inactive_brand(self):
        self.authenticate_admin()

        response = self.client.get(
            f"/api/brands/{self.inactive_brand.id}/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["name"],
            "Old Brand",
        )

    def test_admin_can_create_brand(self):
        self.authenticate_admin()

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

    def test_admin_can_create_brand_without_slug(self):
        self.authenticate_admin()

        response = self.client.post(
            "/api/brands/",
            {
                "name": "Sony",
                "description": "Electronics brand",
                "is_active": True,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        brand = Brand.objects.get(
            name="Sony",
        )

        self.assertEqual(
            brand.slug,
            "sony",
        )

    def test_customer_cannot_create_brand(self):
        self.authenticate_customer()

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

    def test_admin_can_update_brand(self):
        self.authenticate_admin()

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

    def test_customer_cannot_update_brand(self):
        self.authenticate_customer()

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

    def test_admin_can_delete_brand(self):
        self.authenticate_admin()

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

    def test_customer_cannot_delete_brand(self):
        self.authenticate_customer()

        response = self.client.delete(
            f"/api/brands/{self.active_brand.id}/",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

        self.assertTrue(
            Brand.objects.filter(
                id=self.active_brand.id,
            ).exists()
        )

    def test_brand_name_requires_two_characters(self):
        self.authenticate_admin()

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

    def test_duplicate_brand_name_is_rejected(self):
        self.authenticate_admin()

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

    def test_duplicate_brand_slug_is_rejected(self):
        self.authenticate_admin()

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

    def test_brand_name_is_trimmed(self):
        self.authenticate_admin()

        response = self.client.post(
            "/api/brands/",
            {
                "name": "  Sony  ",
                "slug": "sony",
                "description": "Electronics brand",
                "is_active": True,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        brand = Brand.objects.get(
            slug="sony",
        )

        self.assertEqual(
            brand.name,
            "Sony",
        )

    def test_brand_slug_is_normalized(self):
        self.authenticate_admin()

        response = self.client.post(
            "/api/brands/",
            {
                "name": "LG",
                "slug": "  LG  ",
                "description": "Electronics brand",
                "is_active": True,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        brand = Brand.objects.get(
            name="LG",
        )

        self.assertEqual(
            brand.slug,
            "lg",
        )

    def test_invalid_brand_slug_is_rejected(self):
        self.authenticate_admin()

        response = self.client.post(
            "/api/brands/",
            {
                "name": "Invalid Brand",
                "slug": "invalid slug",
                "description": "Invalid slug",
                "is_active": True,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )