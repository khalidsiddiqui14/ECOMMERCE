from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken


User = get_user_model()


class AccountsAPITestCase(APITestCase):
    def setUp(self):
        self.user_data = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "StrongPassword123!",
            "phone": "9876543210",
        }

        self.user = User.objects.create_user(
            username=self.user_data["username"],
            email=self.user_data["email"],
            password=self.user_data["password"],
            phone=self.user_data["phone"],
            role="CUSTOMER",
        )

    def authenticate(self):
        refresh = RefreshToken.for_user(self.user)

        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}"
        )

    # ------------------------------------------------------------------
    # REGISTER
    # ------------------------------------------------------------------

    def test_register_user(self):
        payload = {
            "username": "newuser",
            "email": "new@example.com",
            "password": "StrongPassword123!",
            "phone": "9876543211",
        }

        response = self.client.post(
            reverse("register"),
            payload,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertTrue(
            User.objects.filter(
                email="new@example.com"
            ).exists()
        )

        created_user = User.objects.get(
            email="new@example.com"
        )

        self.assertEqual(
            created_user.role,
            "CUSTOMER",
        )

        self.assertTrue(
            created_user.check_password(
                "StrongPassword123!"
            )
        )

    def test_register_duplicate_email(self):
        payload = {
            "username": "anotheruser",
            "email": self.user.email,
            "password": "StrongPassword123!",
            "phone": "9876543211",
        }

        response = self.client.post(
            reverse("register"),
            payload,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_register_duplicate_phone(self):
        payload = {
            "username": "anotheruser",
            "email": "another@example.com",
            "password": "StrongPassword123!",
            "phone": self.user.phone,
        }

        response = self.client.post(
            reverse("register"),
            payload,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_register_password_is_hashed(self):
        payload = {
            "username": "hashuser",
            "email": "hash@example.com",
            "password": "StrongPassword123!",
            "phone": "9876543212",
        }

        response = self.client.post(
            reverse("register"),
            payload,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        user = User.objects.get(
            email="hash@example.com"
        )

        self.assertNotEqual(
            user.password,
            "StrongPassword123!",
        )

        self.assertTrue(
            user.check_password(
                "StrongPassword123!"
            )
        )

    # ------------------------------------------------------------------
    # LOGIN
    # ------------------------------------------------------------------

    def test_login_user(self):
        payload = {
            "email": self.user.email,
            "password": self.user_data["password"],
        }

        response = self.client.post(
            reverse("login"),
            payload,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertIn(
            "access",
            response.data,
        )

        self.assertIn(
            "refresh",
            response.data,
        )

        self.assertIn(
            "user",
            response.data,
        )

    def test_login_invalid_password(self):
        payload = {
            "email": self.user.email,
            "password": "WrongPassword123!",
        }

        response = self.client.post(
            reverse("login"),
            payload,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_login_invalid_email(self):
        payload = {
            "email": "missing@example.com",
            "password": "StrongPassword123!",
        }

        response = self.client.post(
            reverse("login"),
            payload,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_inactive_user_cannot_login(self):
        self.user.is_active = False
        self.user.save(update_fields=["is_active"])

        payload = {
            "email": self.user.email,
            "password": self.user_data["password"],
        }

        response = self.client.post(
            reverse("login"),
            payload,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertEqual(
            response.data["detail"],
            "This account is inactive.",
        )

    # ------------------------------------------------------------------
    # JWT REFRESH
    # ------------------------------------------------------------------

    def test_refresh_token(self):
        refresh = RefreshToken.for_user(self.user)

        response = self.client.post(
            reverse("refresh"),
            {
                "refresh": str(refresh),
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertIn(
            "access",
            response.data,
        )

    def test_invalid_refresh_token(self):
        response = self.client.post(
            reverse("refresh"),
            {
                "refresh": "invalid-token",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    # ------------------------------------------------------------------
    # PROFILE
    # ------------------------------------------------------------------

    def test_authenticated_user_can_get_profile(self):
        self.authenticate()

        response = self.client.get(
            reverse("profile")
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["email"],
            self.user.email,
        )

        self.assertEqual(
            response.data["username"],
            self.user.username,
        )

        self.assertEqual(
            response.data["phone"],
            self.user.phone,
        )

        self.assertEqual(
            response.data["role"],
            self.user.role,
        )

    def test_unauthenticated_user_cannot_get_profile(self):
        response = self.client.get(
            reverse("profile")
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_authenticated_user_can_update_profile(self):
        self.authenticate()

        payload = {
            "username": "updateduser",
            "phone": "9876543213",
        }

        response = self.client.put(
            reverse("profile"),
            payload,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.user.refresh_from_db()

        self.assertEqual(
            self.user.username,
            "updateduser",
        )

        self.assertEqual(
            self.user.phone,
            "9876543213",
        )

    def test_user_cannot_change_email_through_profile(self):
        self.authenticate()

        payload = {
            "email": "changed@example.com",
        }

        response = self.client.put(
            reverse("profile"),
            payload,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.user.refresh_from_db()

        self.assertEqual(
            self.user.email,
            "test@example.com",
        )

    def test_user_cannot_change_role_through_profile(self):
        self.authenticate()

        payload = {
            "role": "ADMIN",
        }

        response = self.client.put(
            reverse("profile"),
            payload,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.user.refresh_from_db()

        self.assertEqual(
            self.user.role,
            "CUSTOMER",
        )

    # ------------------------------------------------------------------
    # CHANGE PASSWORD
    # ------------------------------------------------------------------

    def test_authenticated_user_can_change_password(self):
        self.authenticate()

        payload = {
            "current_password": self.user_data["password"],
            "new_password": "NewStrongPassword123!",
        }

        response = self.client.post(
            reverse("change-password"),
            payload,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.user.refresh_from_db()

        self.assertTrue(
            self.user.check_password(
                "NewStrongPassword123!"
            )
        )

    def test_change_password_with_wrong_current_password(self):
        self.authenticate()

        payload = {
            "current_password": "WrongPassword123!",
            "new_password": "NewStrongPassword123!",
        }

        response = self.client.post(
            reverse("change-password"),
            payload,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.user.refresh_from_db()

        self.assertTrue(
            self.user.check_password(
                self.user_data["password"]
            )
        )

    def test_change_password_requires_authentication(self):
        payload = {
            "current_password": self.user_data["password"],
            "new_password": "NewStrongPassword123!",
        }

        response = self.client.post(
            reverse("change-password"),
            payload,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_change_password_validates_new_password(self):
        self.authenticate()

        payload = {
            "current_password": self.user_data["password"],
            "new_password": "123",
        }

        response = self.client.post(
            reverse("change-password"),
            payload,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )