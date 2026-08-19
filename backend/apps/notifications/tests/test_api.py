from django.contrib.auth import get_user_model

from rest_framework import status
from rest_framework.test import APITestCase

from apps.notifications.models import Notification


User = get_user_model()


class NotificationAPITestCase(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="notificationuser",
            email="notificationuser@example.com",
            password="TestPass123!",
        )

        self.other_user = User.objects.create_user(
            username="othernotificationuser",
            email="othernotificationuser@example.com",
            password="TestPass123!",
        )

        self.client.force_authenticate(
            user=self.user
        )

        self.notification = Notification.objects.create(
            user=self.user,
            notification_type="SYSTEM",
            title="Welcome",
            message="Welcome to our store.",
            is_read=False,
        )

        self.other_notification = Notification.objects.create(
            user=self.other_user,
            notification_type="SYSTEM",
            title="Other User",
            message="This belongs to another user.",
            is_read=False,
        )

        self.list_url = "/api/notifications/"

    def get_results(self, response):
        if isinstance(response.data, dict):
            return response.data.get(
                "results",
                [],
            )

        return response.data

    def test_authenticated_user_can_list_notifications(self):
        response = self.client.get(
            self.list_url
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        results = self.get_results(
            response
        )

        self.assertEqual(
            len(results),
            1,
        )

        self.assertEqual(
            results[0]["id"],
            self.notification.id,
        )

    def test_unauthenticated_user_cannot_list_notifications(self):
        self.client.force_authenticate(
            user=None
        )

        response = self.client.get(
            self.list_url
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_user_can_retrieve_own_notification(self):
        response = self.client.get(
            f"{self.list_url}{self.notification.id}/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["id"],
            self.notification.id,
        )

        self.assertEqual(
            response.data["title"],
            "Welcome",
        )

    def test_user_cannot_retrieve_other_users_notification(self):
        response = self.client.get(
            f"{self.list_url}{self.other_notification.id}/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

    def test_user_can_delete_own_notification(self):
        notification_id = self.notification.id

        response = self.client.delete(
            f"{self.list_url}{notification_id}/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_204_NO_CONTENT,
        )

        self.assertFalse(
            Notification.objects.filter(
                id=notification_id
            ).exists()
        )

    def test_user_cannot_delete_other_users_notification(self):
        notification_id = self.other_notification.id

        response = self.client.delete(
            f"{self.list_url}{notification_id}/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

        self.assertTrue(
            Notification.objects.filter(
                id=notification_id
            ).exists()
        )

    def test_notification_is_unread_by_default(self):
        notification = Notification.objects.create(
            user=self.user,
            notification_type="ORDER",
            title="Order Created",
            message="Your order has been created.",
        )

        self.assertFalse(
            notification.is_read
        )

    def test_user_can_mark_notification_as_read(self):
        response = self.client.patch(
            f"{self.list_url}"
            f"{self.notification.id}/read/",
            {},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertTrue(
            response.data["is_read"]
        )

        self.notification.refresh_from_db()

        self.assertTrue(
            self.notification.is_read
        )

    def test_user_cannot_mark_other_users_notification_as_read(
        self,
    ):
        response = self.client.patch(
            f"{self.list_url}"
            f"{self.other_notification.id}/read/",
            {},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

        self.other_notification.refresh_from_db()

        self.assertFalse(
            self.other_notification.is_read
        )

    def test_mark_read_endpoint_only_accepts_patch(self):
        response = self.client.put(
            f"{self.list_url}"
            f"{self.notification.id}/read/",
            {},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_405_METHOD_NOT_ALLOWED,
        )

    def test_mark_read_endpoint_requires_authentication(self):
        self.client.force_authenticate(
            user=None
        )

        response = self.client.patch(
            f"{self.list_url}"
            f"{self.notification.id}/read/",
            {},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_notification_contains_expected_fields(self):
        response = self.client.get(
            f"{self.list_url}{self.notification.id}/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        expected_fields = {
            "id",
            "notification_type",
            "title",
            "message",
            "order",
            "is_read",
            "created_at",
            "updated_at",
        }

        self.assertEqual(
            set(response.data.keys()),
            expected_fields,
        )

    def test_notification_types_are_supported(self):
        notification_types = [
            "ORDER",
            "PAYMENT",
            "DELIVERY",
            "SYSTEM",
        ]

        for notification_type in notification_types:
            notification = Notification.objects.create(
                user=self.user,
                notification_type=notification_type,
                title=f"{notification_type} Notification",
                message="Notification message.",
            )

            self.assertEqual(
                notification.notification_type,
                notification_type,
            )

    def test_user_only_sees_own_notifications(self):
        Notification.objects.create(
            user=self.user,
            notification_type="PAYMENT",
            title="Payment Successful",
            message="Your payment was successful.",
        )

        response = self.client.get(
            self.list_url
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        results = self.get_results(
            response
        )

        notification_ids = [
            item["id"]
            for item in results
        ]

        self.assertIn(
            self.notification.id,
            notification_ids,
        )

        self.assertNotIn(
            self.other_notification.id,
            notification_ids,
        )

    def test_notification_delete_does_not_delete_other_users_notification(
        self,
    ):
        response = self.client.delete(
            f"{self.list_url}"
            f"{self.other_notification.id}/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

        self.assertTrue(
            Notification.objects.filter(
                id=self.other_notification.id
            ).exists()
        )