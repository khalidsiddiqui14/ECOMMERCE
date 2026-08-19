from decimal import Decimal

from django.contrib.auth import get_user_model

from rest_framework import status
from rest_framework.test import APITestCase

from apps.orders.models import Order
from apps.payments.models import Payment


User = get_user_model()


class PaymentAPITestCase(APITestCase):

    def setUp(self):
        self.customer = User.objects.create_user(
            username="customer",
            email="customer@example.com",
            password="TestPassword123!",
            role="CUSTOMER",
        )

        self.other_customer = User.objects.create_user(
            username="customer2",
            email="customer2@example.com",
            password="TestPassword123!",
            role="CUSTOMER",
        )

        self.order = Order.objects.create(
            user=self.customer,
            order_number="ORD-PAYMENT-001",
            status="PENDING",
            payment_status="PENDING",
            subtotal=Decimal("4999.00"),
            shipping_cost=Decimal("0.00"),
            total_amount=Decimal("4999.00"),
            shipping_name="Test Customer",
            shipping_phone="9876543210",
            shipping_address="123 Test Street",
            shipping_city="Delhi",
            shipping_state="Delhi",
            shipping_country="India",
            shipping_postal_code="110001",
        )

        self.other_order = Order.objects.create(
            user=self.other_customer,
            order_number="ORD-PAYMENT-002",
            status="PENDING",
            payment_status="PENDING",
            subtotal=Decimal("2999.00"),
            shipping_cost=Decimal("0.00"),
            total_amount=Decimal("2999.00"),
            shipping_name="Other Customer",
            shipping_phone="9876543211",
            shipping_address="456 Other Street",
            shipping_city="Mumbai",
            shipping_state="Maharashtra",
            shipping_country="India",
            shipping_postal_code="400001",
        )

    def payment_data(self, order_id=None):
        return {
            "order": (
                order_id
                if order_id is not None
                else self.order.id
            ),
            "payment_method": "UPI",
        }

    # =========================================================
    # Authentication
    # =========================================================

    def test_unauthenticated_user_cannot_create_payment(self):
        response = self.client.post(
            "/api/payments/",
            self.payment_data(),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_unauthenticated_user_cannot_view_payment(self):
        payment = Payment.objects.create(
            order=self.order,
            amount=self.order.total_amount,
            payment_method="UPI",
            status="PENDING",
        )

        response = self.client.get(
            f"/api/payments/{payment.id}/",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    # =========================================================
    # Payment creation
    # =========================================================

    def test_customer_can_create_payment(self):
        self.client.force_authenticate(
            user=self.customer,
        )

        response = self.client.post(
            "/api/payments/",
            self.payment_data(),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertTrue(
            Payment.objects.filter(
                order=self.order,
            ).exists()
        )

        payment = Payment.objects.get(
            order=self.order,
        )

        self.assertEqual(
            payment.amount,
            Decimal("4999.00"),
        )

        self.assertEqual(
            payment.payment_method,
            "UPI",
        )

        self.assertEqual(
            payment.status,
            "PENDING",
        )

    def test_payment_amount_comes_from_order(self):
        self.client.force_authenticate(
            user=self.customer,
        )

        data = self.payment_data()

        data["amount"] = "1.00"

        response = self.client.post(
            "/api/payments/",
            data,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        payment = Payment.objects.get(
            order=self.order,
        )

        self.assertEqual(
            payment.amount,
            Decimal("4999.00"),
        )

    def test_default_payment_method_is_cod(self):
        self.client.force_authenticate(
            user=self.customer,
        )

        response = self.client.post(
            "/api/payments/",
            {
                "order": self.order.id,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        payment = Payment.objects.get(
            order=self.order,
        )

        self.assertEqual(
            payment.payment_method,
            "COD",
        )

    def test_all_supported_payment_methods_are_accepted(self):
        self.client.force_authenticate(
            user=self.customer,
        )

        methods = (
            "COD",
            "CARD",
            "UPI",
            "NETBANKING",
            "WALLET",
        )

        for index, method in enumerate(methods):
            order = Order.objects.create(
                user=self.customer,
                order_number=(
                    f"ORD-PAY-METHOD-{index}"
                ),
                status="PENDING",
                payment_status="PENDING",
                subtotal=Decimal("1000.00"),
                shipping_cost=Decimal("0.00"),
                total_amount=Decimal("1000.00"),
                shipping_name="Test Customer",
                shipping_phone="9876543210",
                shipping_address="Test Address",
                shipping_city="Delhi",
                shipping_state="Delhi",
                shipping_country="India",
                shipping_postal_code="110001",
            )

            response = self.client.post(
                "/api/payments/",
                {
                    "order": order.id,
                    "payment_method": method,
                },
                format="json",
            )

            self.assertEqual(
                response.status_code,
                status.HTTP_201_CREATED,
            )

            payment = Payment.objects.get(
                order=order,
            )

            self.assertEqual(
                payment.payment_method,
                method,
            )

    # =========================================================
    # Validation
    # =========================================================

    def test_order_is_required(self):
        self.client.force_authenticate(
            user=self.customer,
        )

        response = self.client.post(
            "/api/payments/",
            {
                "payment_method": "UPI",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertFalse(
            Payment.objects.exists()
        )

    def test_invalid_payment_method_is_rejected(self):
        self.client.force_authenticate(
            user=self.customer,
        )

        response = self.client.post(
            "/api/payments/",
            {
                "order": self.order.id,
                "payment_method": "BITCOIN",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertFalse(
            Payment.objects.exists()
        )

    def test_non_integer_order_id_is_rejected(self):
        self.client.force_authenticate(
            user=self.customer,
        )

        response = self.client.post(
            "/api/payments/",
            {
                "order": "abc",
                "payment_method": "UPI",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertFalse(
            Payment.objects.exists()
        )

    def test_zero_order_id_is_rejected(self):
        self.client.force_authenticate(
            user=self.customer,
        )

        response = self.client.post(
            "/api/payments/",
            {
                "order": 0,
                "payment_method": "UPI",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_negative_order_id_is_rejected(self):
        self.client.force_authenticate(
            user=self.customer,
        )

        response = self.client.post(
            "/api/payments/",
            {
                "order": -1,
                "payment_method": "UPI",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_non_existing_order_returns_not_found(self):
        self.client.force_authenticate(
            user=self.customer,
        )

        response = self.client.post(
            "/api/payments/",
            {
                "order": 999999,
                "payment_method": "UPI",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

    # =========================================================
    # Ownership
    # =========================================================

    def test_customer_cannot_pay_for_another_users_order(self):
        self.client.force_authenticate(
            user=self.customer,
        )

        response = self.client.post(
            "/api/payments/",
            self.payment_data(
                self.other_order.id,
            ),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

        self.assertFalse(
            Payment.objects.filter(
                order=self.other_order,
            ).exists()
        )

    def test_customer_cannot_view_another_users_payment(self):
        payment = Payment.objects.create(
            order=self.other_order,
            amount=self.other_order.total_amount,
            payment_method="UPI",
            status="PENDING",
        )

        self.client.force_authenticate(
            user=self.customer,
        )

        response = self.client.get(
            f"/api/payments/{payment.id}/",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

    # =========================================================
    # Cancelled / Paid Orders
    # =========================================================

    def test_cancelled_order_cannot_be_paid(self):
        self.order.status = "CANCELLED"

        self.order.save(
            update_fields=[
                "status",
            ],
        )

        self.client.force_authenticate(
            user=self.customer,
        )

        response = self.client.post(
            "/api/payments/",
            self.payment_data(),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertFalse(
            Payment.objects.filter(
                order=self.order,
            ).exists()
        )

    def test_already_paid_order_cannot_create_payment(self):
        self.order.payment_status = "PAID"

        self.order.save(
            update_fields=[
                "payment_status",
            ],
        )

        self.client.force_authenticate(
            user=self.customer,
        )

        response = self.client.post(
            "/api/payments/",
            self.payment_data(),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertFalse(
            Payment.objects.filter(
                order=self.order,
            ).exists()
        )

    # =========================================================
    # Existing Payments
    # =========================================================

    def test_existing_pending_payment_returns_200(self):
        payment = Payment.objects.create(
            order=self.order,
            amount=self.order.total_amount,
            payment_method="UPI",
            status="PENDING",
        )

        self.client.force_authenticate(
            user=self.customer,
        )

        response = self.client.post(
            "/api/payments/",
            {
                "order": self.order.id,
                "payment_method": "CARD",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        payment.refresh_from_db()

        self.assertEqual(
            payment.amount,
            Decimal("4999.00"),
        )

        self.assertEqual(
            payment.payment_method,
            "CARD",
        )

        self.assertEqual(
            payment.status,
            "PENDING",
        )

    def test_existing_successful_payment_cannot_be_reused(self):
        payment = Payment.objects.create(
            order=self.order,
            amount=self.order.total_amount,
            payment_method="UPI",
            status="SUCCESS",
            transaction_id="TXN-SUCCESS-001",
        )

        self.client.force_authenticate(
            user=self.customer,
        )

        response = self.client.post(
            "/api/payments/",
            {
                "order": self.order.id,
                "payment_method": "CARD",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        payment.refresh_from_db()

        self.assertEqual(
            payment.status,
            "SUCCESS",
        )

        self.assertEqual(
            payment.payment_method,
            "UPI",
        )

    def test_existing_refunded_payment_cannot_be_reused(self):
        Payment.objects.create(
            order=self.order,
            amount=self.order.total_amount,
            payment_method="UPI",
            status="REFUNDED",
            transaction_id="TXN-REFUND-001",
        )

        self.client.force_authenticate(
            user=self.customer,
        )

        response = self.client.post(
            "/api/payments/",
            {
                "order": self.order.id,
                "payment_method": "CARD",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    # =========================================================
    # Payment Detail
    # =========================================================

    def test_customer_can_view_own_payment(self):
        payment = Payment.objects.create(
            order=self.order,
            amount=self.order.total_amount,
            payment_method="UPI",
            status="PENDING",
        )

        self.client.force_authenticate(
            user=self.customer,
        )

        response = self.client.get(
            f"/api/payments/{payment.id}/",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["id"],
            payment.id,
        )

        self.assertEqual(
            response.data["order"],
            self.order.id,
        )

        self.assertEqual(
            Decimal(str(response.data["amount"])),
            Decimal("4999.00"),
        )

        self.assertEqual(
            response.data["payment_method"],
            "UPI",
        )

        self.assertEqual(
            response.data["status"],
            "PENDING",
        )

    def test_payment_detail_does_not_expose_unexpected_fields(self):
        payment = Payment.objects.create(
            order=self.order,
            amount=self.order.total_amount,
            payment_method="UPI",
            status="PENDING",
        )

        self.client.force_authenticate(
            user=self.customer,
        )

        response = self.client.get(
            f"/api/payments/{payment.id}/",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        expected_fields = {
            "id",
            "order",
            "transaction_id",
            "amount",
            "payment_method",
            "status",
            "gateway_response",
            "paid_at",
            "created_at",
            "updated_at",
        }

        self.assertEqual(
            set(response.data.keys()),
            expected_fields,
        )

    # =========================================================
    # Read-only Field Protection
    # =========================================================

    def test_client_cannot_set_payment_status(self):
        self.client.force_authenticate(
            user=self.customer,
        )

        response = self.client.post(
            "/api/payments/",
            {
                "order": self.order.id,
                "payment_method": "UPI",
                "status": "SUCCESS",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        payment = Payment.objects.get(
            order=self.order,
        )

        self.assertEqual(
            payment.status,
            "PENDING",
        )

    def test_client_cannot_set_transaction_id(self):
        self.client.force_authenticate(
            user=self.customer,
        )

        response = self.client.post(
            "/api/payments/",
            {
                "order": self.order.id,
                "payment_method": "UPI",
                "transaction_id": "FAKE-TXN-123",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        payment = Payment.objects.get(
            order=self.order,
        )

        self.assertIsNone(
            payment.transaction_id,
        )

    def test_client_cannot_set_gateway_response(self):
        self.client.force_authenticate(
            user=self.customer,
        )

        response = self.client.post(
            "/api/payments/",
            {
                "order": self.order.id,
                "payment_method": "UPI",
                "gateway_response": {
                    "status": "SUCCESS",
                    "fake": True,
                },
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        payment = Payment.objects.get(
            order=self.order,
        )

        self.assertIsNone(
            payment.gateway_response,
        )

    # =========================================================
    # Amount Integrity
    # =========================================================

    def test_payment_amount_matches_order_total(self):
        self.order.total_amount = Decimal("7499.50")

        self.order.save(
            update_fields=[
                "total_amount",
            ],
        )

        self.client.force_authenticate(
            user=self.customer,
        )

        response = self.client.post(
            "/api/payments/",
            {
                "order": self.order.id,
                "payment_method": "CARD",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        payment = Payment.objects.get(
            order=self.order,
        )

        self.assertEqual(
            payment.amount,
            Decimal("7499.50"),
        )