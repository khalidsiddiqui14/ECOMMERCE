from django.contrib.auth import get_user_model

from rest_framework import status
from rest_framework.test import APITestCase

from apps.addresses.models import Address

User = get_user_model()


class AddressAPITestCase(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="addressuser",
            email="addressuser@example.com",
            password="TestPass123!",
        )

        self.other_user = User.objects.create_user(
            username="otheraddressuser",
            email="otheraddressuser@example.com",
            password="TestPass123!",
        )

        self.list_url = "/api/addresses/"

    def authenticate(self, user=None):
        self.client.force_authenticate(
            user=user or self.user,
        )

    def create_address(
        self,
        user=None,
        is_default=False,
        address_type="HOME",
    ):
        return Address.objects.create(
            user=user or self.user,
            address_type=address_type,
            full_name="Test User",
            phone="9876543210",
            address_line="123 Test Street",
            city="Delhi",
            state="Delhi",
            country="India",
            postal_code="110001",
            is_default=is_default,
        )

    def address_data(self, is_default=False):
        return {
            "address_type": "HOME",
            "full_name": "Test User",
            "phone": "9876543210",
            "address_line": "123 Test Street",
            "city": "Delhi",
            "state": "Delhi",
            "country": "India",
            "postal_code": "110001",
            "is_default": is_default,
        }

    # Authentication tests.

    def test_unauthenticated_user_cannot_list_addresses(self):
        response = self.client.get(
            self.list_url,
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_unauthenticated_user_cannot_create_address(self):
        response = self.client.post(
            self.list_url,
            self.address_data(),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    # Create tests.

    def test_authenticated_user_can_create_address(self):
        self.authenticate()

        response = self.client.post(
            self.list_url,
            self.address_data(),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertEqual(
            Address.objects.filter(
                user=self.user,
            ).count(),
            1,
        )

    def test_first_address_becomes_default_automatically(self):
        self.authenticate()

        response = self.client.post(
            self.list_url,
            self.address_data(
                is_default=False,
            ),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        address = Address.objects.get(
            user=self.user,
        )

        self.assertTrue(
            address.is_default,
        )

    def test_explicit_default_address_is_created_as_default(self):
        self.authenticate()

        response = self.client.post(
            self.list_url,
            self.address_data(
                is_default=True,
            ),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        address = Address.objects.get(
            user=self.user,
        )

        self.assertTrue(
            address.is_default,
        )

    def test_new_default_address_removes_old_default(self):
        self.create_address(
            is_default=True,
        )

        self.authenticate()

        response = self.client.post(
            self.list_url,
            {
                **self.address_data(
                    is_default=True,
                ),
                "address_type": "WORK",
                "address_line": "456 Work Street",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        addresses = Address.objects.filter(
            user=self.user,
        )

        self.assertEqual(
            addresses.filter(
                is_default=True,
            ).count(),
            1,
        )

        default_address = addresses.get(
            is_default=True,
        )

        self.assertEqual(
            default_address.address_type,
            "WORK",
        )

    # List tests.

def test_user_can_list_own_addresses(self):
    first = self.create_address(
        is_default=True,
    )

    second = self.create_address(
        address_type="WORK",
    )

    self.authenticate()

    response = self.client.get(
        self.list_url,
    )

    self.assertEqual(
        response.status_code,
        status.HTTP_200_OK,
    )

    results = response.data["results"]

    self.assertEqual(
        len(results),
        2,
    )

    returned_ids = {
        item["id"]
        for item in results
    }

    self.assertIn(
        first.id,
        returned_ids,
    )

    self.assertIn(
        second.id,
        returned_ids,
    )


def test_user_cannot_see_other_users_addresses(self):
    own_address = self.create_address()

    other_address = self.create_address(
        user=self.other_user,
    )

    self.authenticate()

    response = self.client.get(
        self.list_url,
    )

    self.assertEqual(
        response.status_code,
        status.HTTP_200_OK,
    )

    results = response.data["results"]

    returned_ids = {
        item["id"]
        for item in results
    }

    self.assertIn(
        own_address.id,
        returned_ids,
    )

    self.assertNotIn(
        other_address.id,
        returned_ids,
    )

    # Detail tests.

    def test_user_can_retrieve_own_address(self):
        address = self.create_address()

        self.authenticate()

        response = self.client.get(
            f"{self.list_url}{address.id}/",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["id"],
            address.id,
        )

    def test_user_cannot_retrieve_other_users_address(self):
        address = self.create_address(
            user=self.other_user,
        )

        self.authenticate()

        response = self.client.get(
            f"{self.list_url}{address.id}/",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

    # Update tests.

    def test_user_can_update_own_address(self):
        address = self.create_address()

        self.authenticate()

        response = self.client.patch(
            f"{self.list_url}{address.id}/",
            {
                "city": "Mumbai",
                "postal_code": "400001",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        address.refresh_from_db()

        self.assertEqual(
            address.city,
            "Mumbai",
        )

        self.assertEqual(
            address.postal_code,
            "400001",
        )

    def test_setting_address_as_default_removes_previous_default(self):
        first = self.create_address(
            is_default=True,
        )

        second = self.create_address(
            address_type="WORK",
            is_default=False,
        )

        self.authenticate()

        response = self.client.patch(
            f"{self.list_url}{second.id}/",
            {
                "is_default": True,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        first.refresh_from_db()
        second.refresh_from_db()

        self.assertFalse(
            first.is_default,
        )

        self.assertTrue(
            second.is_default,
        )

    def test_user_cannot_update_other_users_address(self):
        address = self.create_address(
            user=self.other_user,
        )

        self.authenticate()

        response = self.client.patch(
            f"{self.list_url}{address.id}/",
            {
                "city": "Mumbai",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

        address.refresh_from_db()

        self.assertEqual(
            address.city,
            "Delhi",
        )

    # Delete tests.

    def test_user_can_delete_own_address(self):
        address = self.create_address()

        self.authenticate()

        response = self.client.delete(
            f"{self.list_url}{address.id}/",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_204_NO_CONTENT,
        )

        self.assertFalse(
            Address.objects.filter(
                id=address.id,
            ).exists()
        )

    def test_user_cannot_delete_other_users_address(self):
        address = self.create_address(
            user=self.other_user,
        )

        self.authenticate()

        response = self.client.delete(
            f"{self.list_url}{address.id}/",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

        self.assertTrue(
            Address.objects.filter(
                id=address.id,
            ).exists()
        )

    def test_deleting_default_address_promotes_next_address(self):
        default_address = self.create_address(
            is_default=True,
        )

        second_address = self.create_address(
            address_type="WORK",
            is_default=False,
        )

        self.authenticate()

        response = self.client.delete(
            f"{self.list_url}{default_address.id}/",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_204_NO_CONTENT,
        )

        second_address.refresh_from_db()

        self.assertTrue(
            second_address.is_default,
        )

    def test_deleting_only_address_leaves_no_default(self):
        address = self.create_address(
            is_default=True,
        )

        self.authenticate()

        response = self.client.delete(
            f"{self.list_url}{address.id}/",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_204_NO_CONTENT,
        )

        self.assertEqual(
            Address.objects.filter(
                user=self.user,
                is_default=True,
            ).count(),
            0,
        )

    # Validation tests.

    def test_full_name_must_have_at_least_two_characters(self):
        self.authenticate()

        data = self.address_data()
        data["full_name"] = "A"

        response = self.client.post(
            self.list_url,
            data,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_phone_validation_rejects_invalid_phone(self):
        self.authenticate()

        data = self.address_data()
        data["phone"] = "abc123"

        response = self.client.post(
            self.list_url,
            data,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_postal_code_is_required(self):
        self.authenticate()

        data = self.address_data()
        data["postal_code"] = ""

        response = self.client.post(
            self.list_url,
            data,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_address_line_validation(self):
        self.authenticate()

        data = self.address_data()
        data["address_line"] = "123"

        response = self.client.post(
            self.list_url,
            data,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_city_validation(self):
        self.authenticate()

        data = self.address_data()
        data["city"] = "A"

        response = self.client.post(
            self.list_url,
            data,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_state_validation(self):
        self.authenticate()

        data = self.address_data()
        data["state"] = "A"

        response = self.client.post(
            self.list_url,
            data,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_country_validation(self):
        self.authenticate()

        data = self.address_data()
        data["country"] = "A"

        response = self.client.post(
            self.list_url,
            data,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_address_type_choices_are_validated(self):
        self.authenticate()

        data = self.address_data()
        data["address_type"] = "INVALID"

        response = self.client.post(
            self.list_url,
            data,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    # Field protection tests.

    def test_user_field_is_not_exposed(self):
        self.authenticate()

        response = self.client.post(
            self.list_url,
            self.address_data(),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertNotIn(
            "user",
            response.data,
        )