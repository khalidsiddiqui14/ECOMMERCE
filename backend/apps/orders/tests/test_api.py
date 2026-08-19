from decimal import Decimal

from django.contrib.auth import get_user_model

from rest_framework import status
from rest_framework.test import APITestCase

from apps.brands.models import Brand
from apps.categories.models import Category
from apps.products.models import Product
from apps.stores.models import Store
from apps.vendors.models import Vendor
from apps.cart.models import Cart, CartItem
from apps.orders.models import Order, OrderItem


User = get_user_model()


class OrderAPITestCase(APITestCase):

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

        self.vendor_user = User.objects.create_user(
            username="vendor",
            email="vendor@example.com",
            password="TestPassword123!",
            role="VENDOR",
        )

        self.other_vendor_user = User.objects.create_user(
            username="vendor2",
            email="vendor2@example.com",
            password="TestPassword123!",
            role="VENDOR",
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
            address="Other Store Address",
            city="Mumbai",
            state="Maharashtra",
            country="India",
            postal_code="400001",
            is_active=True,
        )

        self.category = Category.objects.create(
            name="Electronics",
            slug="electronics",
            is_active=True,
        )

        self.brand = Brand.objects.create(
            name="Samsung",
            slug="samsung",
            is_active=True,
        )

        self.product = Product.objects.create(
            store=self.store,
            category=self.category,
            brand=self.brand,
            name="Smart Watch",
            slug="smart-watch",
            sku="SW-001",
            description="Test smart watch",
            price=Decimal("4999.00"),
            stock=10,
            status="PUBLISHED",
            is_active=True,
        )

        self.second_product = Product.objects.create(
            store=self.store,
            category=self.category,
            brand=self.brand,
            name="Bluetooth Speaker",
            slug="bluetooth-speaker",
            sku="BS-001",
            description="Test bluetooth speaker",
            price=Decimal("2499.00"),
            stock=5,
            status="PUBLISHED",
            is_active=True,
        )

        self.other_vendor_product = Product.objects.create(
            store=self.other_store,
            category=self.category,
            brand=self.brand,
            name="Other Vendor Product",
            slug="other-vendor-product",
            sku="OVP-001",
            description="Other vendor product",
            price=Decimal("1999.00"),
            stock=10,
            status="PUBLISHED",
            is_active=True,
        )

        self.cart = Cart.objects.create(
            user=self.customer,
        )

    def get_shipping_data(self):
        return {
            "shipping_name": "Test Customer",
            "shipping_phone": "9876543210",
            "shipping_address": "123 Test Street",
            "shipping_city": "Delhi",
            "shipping_state": "Delhi",
            "shipping_country": "India",
            "shipping_postal_code": "110001",
            "notes": "Leave at the door.",
        }

    def test_unauthenticated_user_cannot_access_orders(self):
        response = self.client.get(
            "/api/orders/",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_authenticated_user_can_list_own_orders(self):
        Order.objects.create(
            user=self.customer,
            order_number="ORD-CUSTOMER-001",
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

        self.client.force_authenticate(
            user=self.customer,
        )

        response = self.client.get(
            "/api/orders/",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        # Pagination response
        self.assertEqual(
            response.data["count"],
            1,
        )

        self.assertEqual(
            len(response.data["results"]),
            1,
        )

    def test_customer_cannot_see_other_users_order(self):
        other_order = Order.objects.create(
            user=self.other_customer,
            order_number="ORD-OTHER-001",
            subtotal=Decimal("1999.00"),
            shipping_cost=Decimal("0.00"),
            total_amount=Decimal("1999.00"),
            shipping_name="Other Customer",
            shipping_phone="9876543211",
            shipping_address="Other Address",
            shipping_city="Mumbai",
            shipping_state="Maharashtra",
            shipping_country="India",
            shipping_postal_code="400001",
        )

        self.client.force_authenticate(
            user=self.customer,
        )

        response = self.client.get(
            f"/api/orders/{other_order.id}/",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

    def test_empty_cart_cannot_create_order(self):
        self.client.force_authenticate(
            user=self.customer,
        )

        response = self.client.post(
            "/api/orders/",
            self.get_shipping_data(),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertFalse(
            Order.objects.filter(
                user=self.customer,
            ).exists()
        )

    def test_customer_can_create_order(self):
        CartItem.objects.create(
            cart=self.cart,
            product=self.product,
            quantity=2,
        )

        self.client.force_authenticate(
            user=self.customer,
        )

        response = self.client.post(
            "/api/orders/",
            self.get_shipping_data(),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertEqual(
            Order.objects.filter(
                user=self.customer,
            ).count(),
            1,
        )

        order = Order.objects.get(
            user=self.customer,
        )

        self.assertEqual(
            order.subtotal,
            Decimal("9998.00"),
        )

        self.assertEqual(
            order.shipping_cost,
            Decimal("0.00"),
        )

        self.assertEqual(
            order.total_amount,
            Decimal("9998.00"),
        )

        self.assertEqual(
            order.status,
            "PENDING",
        )

        self.assertEqual(
            order.payment_status,
            "PENDING",
        )

    def test_order_number_is_generated(self):
        CartItem.objects.create(
            cart=self.cart,
            product=self.product,
            quantity=1,
        )

        self.client.force_authenticate(
            user=self.customer,
        )

        response = self.client.post(
            "/api/orders/",
            self.get_shipping_data(),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        order = Order.objects.get(
            user=self.customer,
        )

        self.assertTrue(
            order.order_number.startswith("ORD-"),
        )

        self.assertEqual(
            len(order.order_number),
            16,
        )

    def test_order_item_stores_product_snapshot(self):
        CartItem.objects.create(
            cart=self.cart,
            product=self.product,
            quantity=2,
        )

        self.client.force_authenticate(
            user=self.customer,
        )

        response = self.client.post(
            "/api/orders/",
            self.get_shipping_data(),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        order = Order.objects.get(
            user=self.customer,
        )

        item = OrderItem.objects.get(
            order=order,
        )

        self.assertEqual(
            item.product,
            self.product,
        )

        self.assertEqual(
            item.product_name,
            "Smart Watch",
        )

        self.assertEqual(
            item.sku,
            "SW-001",
        )

        self.assertEqual(
            item.price,
            Decimal("4999.00"),
        )

        self.assertEqual(
            item.quantity,
            2,
        )

        self.assertEqual(
            item.total_price,
            Decimal("9998.00"),
        )

    def test_stock_is_reduced_after_order(self):
        CartItem.objects.create(
            cart=self.cart,
            product=self.product,
            quantity=3,
        )

        self.client.force_authenticate(
            user=self.customer,
        )

        response = self.client.post(
            "/api/orders/",
            self.get_shipping_data(),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.product.refresh_from_db()

        self.assertEqual(
            self.product.stock,
            7,
        )

        self.assertEqual(
            self.product.status,
            "PUBLISHED",
        )

    def test_product_becomes_out_of_stock(self):
        self.product.stock = 2

        self.product.save(
            update_fields=[
                "stock",
            ],
        )

        CartItem.objects.create(
            cart=self.cart,
            product=self.product,
            quantity=2,
        )

        self.client.force_authenticate(
            user=self.customer,
        )

        response = self.client.post(
            "/api/orders/",
            self.get_shipping_data(),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.product.refresh_from_db()

        self.assertEqual(
            self.product.stock,
            0,
        )

        self.assertEqual(
            self.product.status,
            "OUT_OF_STOCK",
        )

    def test_cart_is_cleared_after_order(self):
        CartItem.objects.create(
            cart=self.cart,
            product=self.product,
            quantity=1,
        )

        CartItem.objects.create(
            cart=self.cart,
            product=self.second_product,
            quantity=2,
        )

        self.client.force_authenticate(
            user=self.customer,
        )

        response = self.client.post(
            "/api/orders/",
            self.get_shipping_data(),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertEqual(
            CartItem.objects.filter(
                cart=self.cart,
            ).count(),
            0,
        )

    def test_inactive_product_cannot_be_ordered(self):
        self.product.is_active = False

        self.product.save(
            update_fields=[
                "is_active",
            ],
        )

        CartItem.objects.create(
            cart=self.cart,
            product=self.product,
            quantity=1,
        )

        self.client.force_authenticate(
            user=self.customer,
        )

        response = self.client.post(
            "/api/orders/",
            self.get_shipping_data(),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertFalse(
            Order.objects.filter(
                user=self.customer,
            ).exists()
        )

    def test_unpublished_product_cannot_be_ordered(self):
        self.product.status = "DRAFT"

        self.product.save(
            update_fields=[
                "status",
            ],
        )

        CartItem.objects.create(
            cart=self.cart,
            product=self.product,
            quantity=1,
        )

        self.client.force_authenticate(
            user=self.customer,
        )

        response = self.client.post(
            "/api/orders/",
            self.get_shipping_data(),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertFalse(
            Order.objects.filter(
                user=self.customer,
            ).exists()
        )

    def test_insufficient_stock_cannot_create_order(self):
        CartItem.objects.create(
            cart=self.cart,
            product=self.product,
            quantity=11,
        )

        self.client.force_authenticate(
            user=self.customer,
        )

        response = self.client.post(
            "/api/orders/",
            self.get_shipping_data(),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertFalse(
            Order.objects.filter(
                user=self.customer,
            ).exists()
        )

        self.product.refresh_from_db()

        self.assertEqual(
            self.product.stock,
            10,
        )

    def test_order_creation_is_atomic(self):
        CartItem.objects.create(
            cart=self.cart,
            product=self.product,
            quantity=2,
        )

        CartItem.objects.create(
            cart=self.cart,
            product=self.second_product,
            quantity=6,
        )

        self.client.force_authenticate(
            user=self.customer,
        )

        response = self.client.post(
            "/api/orders/",
            self.get_shipping_data(),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertFalse(
            Order.objects.filter(
                user=self.customer,
            ).exists()
        )

        self.product.refresh_from_db()
        self.second_product.refresh_from_db()

        self.assertEqual(
            self.product.stock,
            10,
        )

        self.assertEqual(
            self.second_product.stock,
            5,
        )

        self.assertEqual(
            CartItem.objects.filter(
                cart=self.cart,
            ).count(),
            2,
        )

    def test_shipping_name_is_required(self):
        CartItem.objects.create(
            cart=self.cart,
            product=self.product,
            quantity=1,
        )

        shipping_data = self.get_shipping_data()

        del shipping_data["shipping_name"]

        self.client.force_authenticate(
            user=self.customer,
        )

        response = self.client.post(
            "/api/orders/",
            shipping_data,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_invalid_shipping_phone_is_rejected(self):
        CartItem.objects.create(
            cart=self.cart,
            product=self.product,
            quantity=1,
        )

        shipping_data = self.get_shipping_data()

        shipping_data["shipping_phone"] = "123"

        self.client.force_authenticate(
            user=self.customer,
        )

        response = self.client.post(
            "/api/orders/",
            shipping_data,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_vendor_can_access_vendor_orders(self):
        order = Order.objects.create(
            user=self.customer,
            order_number="ORD-VENDOR-001",
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

        OrderItem.objects.create(
            order=order,
            product=self.product,
            product_name=self.product.name,
            sku=self.product.sku,
            price=self.product.price,
            quantity=1,
        )

        self.client.force_authenticate(
            user=self.vendor_user,
        )

        response = self.client.get(
            "/api/orders/vendor-orders/",
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
            len(response.data["results"]),
            1,
        )

        self.assertEqual(
            response.data["results"][0]["order_number"],
            "ORD-VENDOR-001",
        )

    def test_vendor_cannot_access_other_vendor_order(self):
        order = Order.objects.create(
            user=self.customer,
            order_number="ORD-OTHER-VENDOR-001",
            subtotal=Decimal("1999.00"),
            shipping_cost=Decimal("0.00"),
            total_amount=Decimal("1999.00"),
            shipping_name="Test Customer",
            shipping_phone="9876543210",
            shipping_address="123 Test Street",
            shipping_city="Delhi",
            shipping_state="Maharashtra",
            shipping_country="India",
            shipping_postal_code="110001",
        )

        OrderItem.objects.create(
            order=order,
            product=self.other_vendor_product,
            product_name=self.other_vendor_product.name,
            sku=self.other_vendor_product.sku,
            price=self.other_vendor_product.price,
            quantity=1,
        )

        self.client.force_authenticate(
            user=self.vendor_user,
        )

        response = self.client.get(
            "/api/orders/vendor-orders/",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["count"],
            0,
        )

        self.assertEqual(
            len(response.data["results"]),
            0,
        )

    def test_vendor_dashboard(self):
        order = Order.objects.create(
            user=self.customer,
            order_number="ORD-DASHBOARD-001",
            subtotal=Decimal("9998.00"),
            shipping_cost=Decimal("0.00"),
            total_amount=Decimal("9998.00"),
            shipping_name="Test Customer",
            shipping_phone="9876543210",
            shipping_address="123 Test Street",
            shipping_city="Delhi",
            shipping_state="Delhi",
            shipping_country="India",
            shipping_postal_code="110001",
        )

        OrderItem.objects.create(
            order=order,
            product=self.product,
            product_name=self.product.name,
            sku=self.product.sku,
            price=self.product.price,
            quantity=2,
        )

        self.client.force_authenticate(
            user=self.vendor_user,
        )

        response = self.client.get(
            "/api/orders/vendor-dashboard/",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        # Current vendor has exactly 2 products.
        self.assertEqual(
            response.data["stats"]["total_products"],
            2,
        )

        self.assertEqual(
            response.data["stats"]["total_orders"],
            1,
        )

        self.assertEqual(
            response.data["stats"]["pending_orders"],
            1,
        )

        self.assertEqual(
          Decimal(str(response.data["stats"]["revenue"])),
          Decimal("9998.00"),
        )

    def test_vendor_can_update_own_order_status(self):
        order = Order.objects.create(
            user=self.customer,
            order_number="ORD-STATUS-001",
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
            status="PENDING",
        )

        OrderItem.objects.create(
            order=order,
            product=self.product,
            product_name=self.product.name,
            sku=self.product.sku,
            price=self.product.price,
            quantity=1,
        )

        self.client.force_authenticate(
            user=self.vendor_user,
        )

        response = self.client.patch(
            f"/api/orders/{order.id}/vendor-status/",
            {
                "status": "CONFIRMED",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        order.refresh_from_db()

        self.assertEqual(
            order.status,
            "CONFIRMED",
        )

    def test_invalid_vendor_status_transition_is_rejected(self):
        order = Order.objects.create(
            user=self.customer,
            order_number="ORD-INVALID-STATUS-001",
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
            status="PENDING",
        )

        OrderItem.objects.create(
            order=order,
            product=self.product,
            product_name=self.product.name,
            sku=self.product.sku,
            price=self.product.price,
            quantity=1,
        )

        self.client.force_authenticate(
            user=self.vendor_user,
        )

        response = self.client.patch(
            f"/api/orders/{order.id}/vendor-status/",
            {
                "status": "DELIVERED",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        order.refresh_from_db()

        self.assertEqual(
            order.status,
            "PENDING",
        )

    def test_delivered_order_cannot_be_changed(self):
        order = Order.objects.create(
            user=self.customer,
            order_number="ORD-DELIVERED-001",
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
            status="DELIVERED",
        )

        OrderItem.objects.create(
            order=order,
            product=self.product,
            product_name=self.product.name,
            sku=self.product.sku,
            price=self.product.price,
            quantity=1,
        )

        self.client.force_authenticate(
            user=self.vendor_user,
        )

        response = self.client.patch(
            f"/api/orders/{order.id}/vendor-status/",
            {
                "status": "CANCELLED",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_cancelled_order_cannot_be_changed(self):
        order = Order.objects.create(
            user=self.customer,
            order_number="ORD-CANCELLED-001",
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
            status="CANCELLED",
        )

        OrderItem.objects.create(
            order=order,
            product=self.product,
            product_name=self.product.name,
            sku=self.product.sku,
            price=self.product.price,
            quantity=1,
        )

        self.client.force_authenticate(
            user=self.vendor_user,
        )

        response = self.client.patch(
            f"/api/orders/{order.id}/vendor-status/",
            {
                "status": "CONFIRMED",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_vendor_cannot_update_other_vendor_order(self):
        order = Order.objects.create(
            user=self.customer,
            order_number="ORD-FORBIDDEN-001",
            subtotal=Decimal("1999.00"),
            shipping_cost=Decimal("0.00"),
            total_amount=Decimal("1999.00"),
            shipping_name="Test Customer",
            shipping_phone="9876543210",
            shipping_address="123 Test Street",
            shipping_city="Delhi",
            shipping_state="Delhi",
            shipping_country="India",
            shipping_postal_code="110001",
        )

        OrderItem.objects.create(
            order=order,
            product=self.other_vendor_product,
            product_name=self.other_vendor_product.name,
            sku=self.other_vendor_product.sku,
            price=self.other_vendor_product.price,
            quantity=1,
        )

        self.client.force_authenticate(
            user=self.vendor_user,
        )

        response = self.client.patch(
            f"/api/orders/{order.id}/vendor-status/",
            {
                "status": "CONFIRMED",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )