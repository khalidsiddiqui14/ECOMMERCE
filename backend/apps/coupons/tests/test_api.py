from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.utils import timezone

from rest_framework import status
from rest_framework.test import APITestCase

from apps.coupons.models import Coupon


User = get_user_model()


class CouponAPITestCase(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="couponuser",
            email="couponuser@example.com",
            password="TestPass123!",
        )

        self.admin = User.objects.create_user(
            username="couponadmin",
            email="couponadmin@example.com",
            password="TestPass123!",
            role="ADMIN",
        )

        self.vendor = User.objects.create_user(
            username="couponvendor",
            email="couponvendor@example.com",
            password="TestPass123!",
            role="VENDOR",
        )

        self.start_date = timezone.now() - timedelta(
            days=1,
        )

        self.end_date = timezone.now() + timedelta(
            days=30,
        )

        self.coupon = Coupon.objects.create(
            code="SAVE10",
            discount_type="PERCENTAGE",
            discount_value=Decimal("10.00"),
            minimum_order_amount=Decimal("500.00"),
            maximum_discount_amount=Decimal("1000.00"),
            usage_limit=10,
            used_count=0,
            per_user_limit=1,
            start_date=self.start_date,
            end_date=self.end_date,
            is_active=True,
        )

        self.list_url = "/api/coupons/"

    def authenticate(self, user=None):
        self.client.force_authenticate(
            user=user or self.user,
        )

    def coupon_data(self, **overrides):
        data = {
            "code": "NEWCODE",
            "discount_type": "PERCENTAGE",
            "discount_value": "15.00",
            "minimum_order_amount": "500.00",
            "maximum_discount_amount": "500.00",
            "usage_limit": 100,
            "per_user_limit": 1,
            "start_date": self.start_date.isoformat(),
            "end_date": self.end_date.isoformat(),
            "is_active": True,
        }

        data.update(overrides)

        return data

    def get_results(self, response):
        if isinstance(response.data, dict):
            return response.data.get(
                "results",
                [],
            )

        return response.data

    def test_public_user_can_list_coupons(self):
        response = self.client.get(
            self.list_url,
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

    def test_user_cannot_create_coupon(self):
        self.authenticate()

        response = self.client.post(
            self.list_url,
            self.coupon_data(),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    def test_admin_can_create_coupon(self):
        self.authenticate(self.admin)

        response = self.client.post(
            self.list_url,
            self.coupon_data(),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertTrue(
            Coupon.objects.filter(
                code="NEWCODE",
            ).exists()
        )

    def test_public_user_can_validate_coupon(self):
        response = self.client.post(
            f"{self.list_url}validate/",
            {
                "code": "SAVE10",
                "order_amount": "1000.00",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["code"],
            "SAVE10",
        )

        self.assertEqual(
            response.data["discount_amount"],
            "100.00",
        )

        self.assertEqual(
            response.data["final_amount"],
            "900.00",
        )

        self.assertTrue(
            response.data["is_valid"],
        )

    def test_coupon_code_is_case_insensitive(self):
        response = self.client.post(
            f"{self.list_url}validate/",
            {
                "code": "save10",
                "order_amount": "1000.00",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

    def test_missing_coupon_code_is_rejected(self):
        response = self.client.post(
            f"{self.list_url}validate/",
            {
                "order_amount": "1000.00",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_missing_order_amount_is_rejected(self):
        response = self.client.post(
            f"{self.list_url}validate/",
            {
                "code": "SAVE10",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_invalid_order_amount_is_rejected(self):
        response = self.client.post(
            f"{self.list_url}validate/",
            {
                "code": "SAVE10",
                "order_amount": "abc",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_negative_order_amount_is_rejected(self):
        response = self.client.post(
            f"{self.list_url}validate/",
            {
                "code": "SAVE10",
                "order_amount": "-100.00",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_non_existing_coupon_is_rejected(self):
        response = self.client.post(
            f"{self.list_url}validate/",
            {
                "code": "NOTEXIST",
                "order_amount": "1000.00",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

    def test_inactive_coupon_is_rejected(self):
        self.coupon.is_active = False
        self.coupon.save(
            update_fields=["is_active"],
        )

        response = self.client.post(
            f"{self.list_url}validate/",
            {
                "code": "SAVE10",
                "order_amount": "1000.00",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_future_coupon_is_rejected(self):
        self.coupon.start_date = timezone.now() + timedelta(
            days=1,
        )
        self.coupon.save(
            update_fields=["start_date"],
        )

        response = self.client.post(
            f"{self.list_url}validate/",
            {
                "code": "SAVE10",
                "order_amount": "1000.00",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_expired_coupon_is_rejected(self):
        self.coupon.end_date = timezone.now() - timedelta(
            days=1,
        )
        self.coupon.save(
            update_fields=["end_date"],
        )

        response = self.client.post(
            f"{self.list_url}validate/",
            {
                "code": "SAVE10",
                "order_amount": "1000.00",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_usage_limit_is_enforced(self):
        self.coupon.used_count = self.coupon.usage_limit
        self.coupon.save(
            update_fields=["used_count"],
        )

        response = self.client.post(
            f"{self.list_url}validate/",
            {
                "code": "SAVE10",
                "order_amount": "1000.00",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_minimum_order_amount_is_enforced(self):
        response = self.client.post(
            f"{self.list_url}validate/",
            {
                "code": "SAVE10",
                "order_amount": "400.00",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_percentage_discount_is_calculated(self):
        response = self.client.post(
            f"{self.list_url}validate/",
            {
                "code": "SAVE10",
                "order_amount": "2000.00",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["discount_amount"],
            "200.00",
        )

        self.assertEqual(
            response.data["final_amount"],
            "1800.00",
        )

    def test_maximum_discount_is_applied(self):
        self.coupon.maximum_discount_amount = Decimal(
            "50.00"
        )

        self.coupon.save(
            update_fields=[
                "maximum_discount_amount",
            ],
        )

        response = self.client.post(
            f"{self.list_url}validate/",
            {
                "code": "SAVE10",
                "order_amount": "2000.00",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["discount_amount"],
            "50.00",
        )

        self.assertEqual(
            response.data["final_amount"],
            "1950.00",
        )

    def test_fixed_discount_is_calculated(self):
        self.coupon.discount_type = "FIXED"
        self.coupon.discount_value = Decimal(
            "100.00"
        )

        self.coupon.save(
            update_fields=[
                "discount_type",
                "discount_value",
            ],
        )

        response = self.client.post(
            f"{self.list_url}validate/",
            {
                "code": "SAVE10",
                "order_amount": "1000.00",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["discount_amount"],
            "100.00",
        )

        self.assertEqual(
            response.data["final_amount"],
            "900.00",
        )

    def test_customer_cannot_use_coupon(self):
        self.authenticate()

        response = self.client.post(
            f"{self.list_url}use/",
            {
                "coupon": self.coupon.id,
                "order_amount": "1000.00",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    def test_vendor_can_use_coupon(self):
        self.authenticate(self.vendor)

        response = self.client.post(
            f"{self.list_url}use/",
            {
                "coupon": self.coupon.id,
                "order_amount": "1000.00",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.coupon.refresh_from_db()

        self.assertEqual(
            self.coupon.used_count,
            1,
        )

        self.assertEqual(
            response.data["discount_amount"],
            "100.00",
        )

    def test_admin_can_use_coupon(self):
        self.authenticate(self.admin)

        response = self.client.post(
            f"{self.list_url}use/",
            {
                "coupon": self.coupon.id,
                "order_amount": "1000.00",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.coupon.refresh_from_db()

        self.assertEqual(
            self.coupon.used_count,
            1,
        )

    def test_coupon_use_increments_used_count(self):
        self.authenticate(self.admin)

        response = self.client.post(
            f"{self.list_url}use/",
            {
                "coupon": self.coupon.id,
                "order_amount": "1000.00",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.coupon.refresh_from_db()

        self.assertEqual(
            self.coupon.used_count,
            1,
        )

    def test_coupon_use_respects_usage_limit(self):
        self.coupon.used_count = self.coupon.usage_limit
        self.coupon.save(
            update_fields=["used_count"],
        )

        self.authenticate(self.admin)

        response = self.client.post(
            f"{self.list_url}use/",
            {
                "coupon": self.coupon.id,
                "order_amount": "1000.00",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_admin_can_retrieve_coupon(self):
        self.authenticate(self.admin)

        response = self.client.get(
            f"{self.list_url}{self.coupon.id}/",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["code"],
            "SAVE10",
        )

    def test_non_admin_cannot_retrieve_coupon_detail(self):
        self.authenticate()

        response = self.client.get(
            f"{self.list_url}{self.coupon.id}/",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    def test_admin_can_update_coupon(self):
        self.authenticate(self.admin)

        response = self.client.patch(
            f"{self.list_url}{self.coupon.id}/",
            {
                "discount_value": "20.00",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.coupon.refresh_from_db()

        self.assertEqual(
            self.coupon.discount_value,
            Decimal("20.00"),
        )

    def test_admin_can_delete_coupon(self):
        self.authenticate(self.admin)

        coupon_id = self.coupon.id

        response = self.client.delete(
            f"{self.list_url}{coupon_id}/",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_204_NO_CONTENT,
        )

        self.assertFalse(
            Coupon.objects.filter(
                id=coupon_id,
            ).exists()
        )

    def test_coupon_code_is_normalized(self):
        self.authenticate(self.admin)

        response = self.client.post(
            self.list_url,
            self.coupon_data(
                code="newcode",
            ),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertTrue(
            Coupon.objects.filter(
                code="NEWCODE",
            ).exists()
        )

    def test_percentage_discount_cannot_exceed_100(self):
        self.authenticate(self.admin)

        response = self.client.post(
            self.list_url,
            self.coupon_data(
                code="OVER100",
                discount_value="101.00",
            ),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_end_date_must_be_after_start_date(self):
        self.authenticate(self.admin)

        response = self.client.post(
            self.list_url,
            self.coupon_data(
                code="BADDATE",
                start_date=self.end_date.isoformat(),
                end_date=self.start_date.isoformat(),
            ),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_discount_value_must_be_positive(self):
        self.authenticate(self.admin)

        response = self.client.post(
            self.list_url,
            self.coupon_data(
                code="ZERODISCOUNT",
                discount_value="0.00",
            ),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )