from django.contrib.auth import get_user_model

from rest_framework import status
from rest_framework.test import APITestCase

from apps.vendors.models import Vendor


User = get_user_model()


class VendorAPITestCase(APITestCase):

    def setUp(self):
        self.vendor_user = User.objects.create_user(
            username="vendoruser",
            email="vendor@example.com",
            password="TestPass123!",
            role="VENDOR",
        )

        self.other_vendor_user = User.objects.create_user(
            username="othervendoruser",
            email="othervendor@example.com",
            password="TestPass123!",
            role="VENDOR",
        )

        self.customer = User.objects.create_user(
            username="customeruser",
            email="customer@example.com",
            password="TestPass123!",
            role="CUSTOMER",
        )

        self.vendor = Vendor.objects.create(
            user=self.vendor_user,
            business_name="Test Vendor",
            phone="9000000001",
            gst_number="GSTTEST0001",
            address="Test Vendor Address",
            city="Delhi",
            state="Delhi",
            country="India",
            postal_code="110001",
            is_verified=False,
            is_active=True,
        )

        self.other_vendor = Vendor.objects.create(
            user=self.other_vendor_user,
            business_name="Other Vendor",
            phone="9000000002",
            gst_number="GSTTEST0002",
            address="Other Vendor Address",
            city="Mumbai",
            state="Maharashtra",
            country="India",
            postal_code="400001",
            is_verified=False,
            is_active=True,
        )

        self.create_url = "/api/vendors/"
        self.detail_url = "/api/vendors/me/"

    def test_vendor_can_retrieve_own_profile(self):
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
            self.vendor.id,
        )

        self.assertEqual(
            response.data["business_name"],
            "Test Vendor",
        )

    def test_vendor_can_update_own_profile(self):
        self.client.force_authenticate(
            user=self.vendor_user,
        )

        response = self.client.patch(
            self.detail_url,
            {
                "business_name": "Updated Vendor",
                "city": "Gurgaon",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.vendor.refresh_from_db()

        self.assertEqual(
            self.vendor.business_name,
            "Updated Vendor",
        )

        self.assertEqual(
            self.vendor.city,
            "Gurgaon",
        )

    def test_vendor_can_create_profile(self):
        new_user = User.objects.create_user(
            username="newvendoruser",
            email="newvendor@example.com",
            password="TestPass123!",
            role="VENDOR",
        )

        self.client.force_authenticate(
            user=new_user,
        )

        response = self.client.post(
            self.create_url,
            {
                "business_name": "New Vendor",
                "phone": "9000000003",
                "gst_number": "GSTTEST0003",
                "address": "New Vendor Address",
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

        vendor = Vendor.objects.get(
            user=new_user,
        )

        self.assertEqual(
            vendor.business_name,
            "New Vendor",
        )

    def test_vendor_cannot_create_duplicate_profile(self):
        self.client.force_authenticate(
            user=self.vendor_user,
        )

        response = self.client.post(
            self.create_url,
            {
                "business_name": "Second Vendor",
                "phone": "9000000010",
                "gst_number": "GSTTEST0010",
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

    def test_customer_cannot_create_vendor_profile(self):
        self.client.force_authenticate(
            user=self.customer,
        )

        response = self.client.post(
            self.create_url,
            {
                "business_name": "Customer Vendor",
                "phone": "9000000011",
                "gst_number": "GSTTEST0011",
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

    def test_customer_cannot_retrieve_vendor_profile(self):
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

    def test_customer_cannot_update_vendor_profile(self):
        self.client.force_authenticate(
            user=self.customer,
        )

        response = self.client.patch(
            self.detail_url,
            {
                "business_name": "Unauthorized Update",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    def test_unauthenticated_user_cannot_create_vendor(self):
        response = self.client.post(
            self.create_url,
            {
                "business_name": "Unauthenticated Vendor",
                "phone": "9000000012",
                "gst_number": "GSTTEST0012",
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

    def test_unauthenticated_user_cannot_retrieve_vendor(self):
        response = self.client.get(
            self.detail_url,
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_vendor_user_field_is_read_only(self):
        self.client.force_authenticate(
            user=self.vendor_user,
        )

        response = self.client.patch(
            self.detail_url,
            {
                "user": self.other_vendor_user.id,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.vendor.refresh_from_db()

        self.assertEqual(
            self.vendor.user_id,
            self.vendor_user.id,
        )

    def test_vendor_is_verified_field_is_read_only(self):
        self.client.force_authenticate(
            user=self.vendor_user,
        )

        response = self.client.patch(
            self.detail_url,
            {
                "is_verified": True,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.vendor.refresh_from_db()

        self.assertFalse(
            self.vendor.is_verified,
        )

    def test_vendor_is_active_field_is_read_only(self):
        self.client.force_authenticate(
            user=self.vendor_user,
        )

        response = self.client.patch(
            self.detail_url,
            {
                "is_active": False,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.vendor.refresh_from_db()

        self.assertTrue(
            self.vendor.is_active,
        )

    def test_business_name_is_normalized(self):
        self.client.force_authenticate(
            user=self.vendor_user,
        )

        response = self.client.patch(
            self.detail_url,
            {
                "business_name": "  Updated Vendor  ",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.vendor.refresh_from_db()

        self.assertEqual(
            self.vendor.business_name,
            "Updated Vendor",
        )

    def test_phone_is_normalized(self):
        self.client.force_authenticate(
            user=self.vendor_user,
        )

        response = self.client.patch(
            self.detail_url,
            {
                "phone": " 9000000099 ",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.vendor.refresh_from_db()

        self.assertEqual(
            self.vendor.phone,
            "9000000099",
        )

    def test_gst_number_is_normalized(self):
        self.client.force_authenticate(
            user=self.vendor_user,
        )

        response = self.client.patch(
            self.detail_url,
            {
                "gst_number": " gsttest9999 ",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.vendor.refresh_from_db()

        self.assertEqual(
            self.vendor.gst_number,
            "GSTTEST9999",
        )

    def test_duplicate_phone_is_rejected(self):
        self.client.force_authenticate(
            user=self.vendor_user,
        )

        response = self.client.patch(
            self.detail_url,
            {
                "phone": self.other_vendor.phone,
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

    def test_duplicate_gst_number_is_rejected(self):
        self.client.force_authenticate(
            user=self.vendor_user,
        )

        response = self.client.patch(
            self.detail_url,
            {
                "gst_number": self.other_vendor.gst_number,
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

    def test_short_business_name_is_rejected(self):
        self.client.force_authenticate(
            user=self.vendor_user,
        )

        response = self.client.patch(
            self.detail_url,
            {
                "business_name": "AB",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_inactive_vendor_cannot_access_vendor_api(self):
        self.vendor.is_active = False
        self.vendor.save(
            update_fields=[
                "is_active",
            ]
        )

        self.client.force_authenticate(
            user=self.vendor_user,
        )

        response = self.client.get(
            self.detail_url,
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    def test_vendor_string_representation(self):
        self.assertEqual(
            str(self.vendor),
            "Test Vendor",
        )