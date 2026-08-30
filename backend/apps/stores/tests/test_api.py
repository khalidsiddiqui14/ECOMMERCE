from django.contrib.auth import get_user_model

from rest_framework import status
from rest_framework.test import APITestCase

from apps.stores.models import Store
from apps.vendors.models import Vendor


User = get_user_model()


class StoreAPITestCase(APITestCase):

    def setUp(self):
        self.vendor_user = User.objects.create_user(
            username="storevendor",
            email="storevendor@example.com",
            password="TestPass123!",
            role="VENDOR",
        )

        self.other_vendor_user = User.objects.create_user(
            username="otherstorevendor",
            email="otherstorevendor@example.com",
            password="TestPass123!",
            role="VENDOR",
        )

        self.customer = User.objects.create_user(
            username="storecustomer",
            email="storecustomer@example.com",
            password="TestPass123!",
            role="CUSTOMER",
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

        self.other_vendor = Vendor.objects.create(
            user=self.other_vendor_user,
            business_name="Other Vendor",
            phone="9000000002",
            address="Other Vendor Address",
            city="Mumbai",
            state="Maharashtra",
            country="India",
            postal_code="400001",
        )

        self.store = Store.objects.create(
            vendor=self.vendor,
            name="Test Store",
            slug="test-store",
            description="Test store description.",
            email="store@example.com",
            phone="9000000011",
            address="Store Address",
            city="Delhi",
            state="Delhi",
            country="India",
            postal_code="110001",
            is_active=True,
        )

        self.other_store = Store.objects.create(
            vendor=self.other_vendor,
            name="Other Store",
            slug="other-store",
            description="Other store description.",
            email="otherstore@example.com",
            phone="9000000012",
            address="Other Store Address",
            city="Mumbai",
            state="Maharashtra",
            country="India",
            postal_code="400001",
            is_active=True,
        )

        self.create_url = "/api/stores/"
        self.detail_url = "/api/stores/me/"

    def test_vendor_can_retrieve_own_store(self):
        self.client.force_authenticate(
            user=self.vendor_user,
        )

        response = self.client.get(
            self.detail_url,
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["id"],
            self.store.id,
        )

        self.assertEqual(
            response.data["name"],
            "Test Store",
        )

    def test_vendor_can_update_own_store(self):
        self.client.force_authenticate(
            user=self.vendor_user,
        )

        response = self.client.patch(
            self.detail_url,
            {
                "name": "Updated Store",
                "city": "Gurgaon",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.store.refresh_from_db()

        self.assertEqual(
            self.store.name,
            "Updated Store",
        )

        self.assertEqual(
            self.store.city,
            "Gurgaon",
        )

    def test_vendor_cannot_create_second_store(self):
        self.client.force_authenticate(
            user=self.vendor_user,
        )

        response = self.client.post(
            self.create_url,
            {
                "name": "Second Store",
                "slug": "second-store",
                "description": "Second store.",
                "email": "second@example.com",
                "phone": "9000000099",
                "address": "Second Address",
                "city": "Delhi",
                "state": "Delhi",
                "country": "India",
                "postal_code": "110001",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertIn(
            "already exists",
            str(response.data),
        )

        self.assertEqual(
            Store.objects.filter(
                vendor=self.vendor,
            ).count(),
            1,
        )

    def test_vendor_can_create_store(self):
        new_vendor_user = User.objects.create_user(
            username="newstorevendor",
            email="newstorevendor@example.com",
            password="TestPass123!",
            role="VENDOR",
        )

        Vendor.objects.create(
            user=new_vendor_user,
            business_name="New Vendor",
            phone="9000000030",
            address="New Vendor Address",
            city="Jaipur",
            state="Rajasthan",
            country="India",
            postal_code="302001",
        )

        self.client.force_authenticate(
            user=new_vendor_user,
        )

        response = self.client.post(
            self.create_url,
            {
                "name": "New Store",
                "slug": "new-store",
                "description": "New store description.",
                "email": "newstore@example.com",
                "phone": "9000000031",
                "address": "New Store Address",
                "city": "Jaipur",
                "state": "Rajasthan",
                "country": "India",
                "postal_code": "302001",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        store = Store.objects.get(
            slug="new-store",
        )

        self.assertEqual(
            store.vendor.user,
            new_vendor_user,
        )

    def test_non_vendor_cannot_create_store(self):
        self.client.force_authenticate(
            user=self.customer,
        )

        response = self.client.post(
            self.create_url,
            {
                "name": "Customer Store",
                "slug": "customer-store",
                "description": "Customer store.",
                "email": "customerstore@example.com",
                "phone": "9000000040",
                "address": "Customer Address",
                "city": "Delhi",
                "state": "Delhi",
                "country": "India",
                "postal_code": "110001",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    def test_non_vendor_cannot_retrieve_store(self):
        self.client.force_authenticate(
            user=self.customer,
        )

        response = self.client.get(
            self.detail_url,
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    def test_non_vendor_cannot_update_store(self):
        self.client.force_authenticate(
            user=self.customer,
        )

        response = self.client.patch(
            self.detail_url,
            {
                "name": "Unauthorized Store",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    def test_unauthenticated_user_cannot_create_store(self):
        response = self.client.post(
            self.create_url,
            {
                "name": "Unauthenticated Store",
                "slug": "unauthenticated-store",
                "description": "Test store.",
                "email": "unauth@example.com",
                "phone": "9000000050",
                "address": "Test Address",
                "city": "Delhi",
                "state": "Delhi",
                "country": "India",
                "postal_code": "110001",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_unauthenticated_user_cannot_retrieve_store(self):
        response = self.client.get(
            self.detail_url,
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_vendor_cannot_change_vendor_field(self):
        self.client.force_authenticate(
            user=self.vendor_user,
        )

        response = self.client.patch(
            self.detail_url,
            {
                "vendor": self.other_vendor.id,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.store.refresh_from_db()

        self.assertEqual(
            self.store.vendor_id,
            self.vendor.id,
        )

    def test_store_name_is_normalized(self):
        self.client.force_authenticate(
            user=self.vendor_user,
        )

        response = self.client.patch(
            self.detail_url,
            {
                "name": "  Updated Store  ",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.store.refresh_from_db()

        self.assertEqual(
            self.store.name,
            "Updated Store",
        )

    def test_store_slug_is_normalized(self):
        self.client.force_authenticate(
            user=self.vendor_user,
        )

        response = self.client.patch(
            self.detail_url,
            {
                "slug": "  UPDATED-STORE-SLUG  ",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.store.refresh_from_db()

        self.assertEqual(
            self.store.slug,
            "updated-store-slug",
        )

    def test_store_email_is_normalized(self):
        self.client.force_authenticate(
            user=self.vendor_user,
        )

        response = self.client.patch(
            self.detail_url,
            {
                "email": "  STORE@EXAMPLE.COM  ",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.store.refresh_from_db()

        self.assertEqual(
            self.store.email,
            "store@example.com",
        )

    def test_store_string_representation(self):
        self.assertEqual(
            str(self.store),
            "Test Store",
        )

    def test_vendor_can_only_access_own_store(self):
        self.client.force_authenticate(
            user=self.other_vendor_user,
        )

        response = self.client.get(
            self.detail_url,
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["id"],
            self.other_store.id,
        )

        self.assertNotEqual(
            response.data["id"],
            self.store.id,
        )