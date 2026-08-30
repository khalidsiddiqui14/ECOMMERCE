from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.utils import timezone

from rest_framework import status
from rest_framework.test import APITestCase

from apps.brands.models import Brand
from apps.cart.models import Cart, CartItem
from apps.categories.models import Category
from apps.coupons.models import Coupon
from apps.products.models import Product
from apps.stores.models import Store
from apps.vendors.models import Vendor

from apps.orders.models import Order, OrderItem


User = get_user_model()


class OrderAPITestCase(APITestCase):

    def setUp(self):
        # Create customer user.
        self.customer = User.objects.create_user(
            username="customer",
            email="customer@example.com",
            password="TestPassword123!",
            role="CUSTOMER",
        )

        # Create vendor user.
        self.vendor_user = User.objects.create_user(
            username="vendor",
            email="vendor@example.com",
            password="TestPassword123!",
            role="VENDOR",
        )

        # Create vendor profile.
        self.vendor = Vendor.objects.create(
            user=self.vendor_user,
            business_name="Test Vendor",
            phone="9876543211",
            address="123 Vendor Street",
            city="Delhi",
            state="Delhi",
            country="India",
            postal_code="110001",
            is_verified=True,
            is_active=True,
        )

        # Create admin user.
        self.admin = User.objects.create_user(
            username="admin",
            email="admin@example.com",
            password="TestPassword123!",
            role="ADMIN",
        )

        # Create category.
        self.category = Category.objects.create(
            name="Electronics",
            slug="electronics",
            description="Electronic products",
            is_active=True,
        )

        # Create brand.
        self.brand = Brand.objects.create(
            name="Samsung",
            slug="samsung",
            description="Electronic brand",
            is_active=True,
        )

        # Create store.
        self.store = Store.objects.create(
            vendor=self.vendor,
            name="Test Store",
            slug="test-store",
            description="Test store",
            email="store@example.com",
            phone="9876543212",
            address="123 Store Street",
            city="Delhi",
            state="Delhi",
            country="India",
            postal_code="110001",
            is_active=True,
        )

        # Create product.
        self.product = Product.objects.create(
            store=self.store,
            category=self.category,
            brand=self.brand,
            name="Samsung Phone",
            slug="samsung-phone",
            sku="SAM-PHONE-001",
            description="Test phone",
            price=Decimal("1000.00"),
            stock=10,
            status="PUBLISHED",
            is_active=True,
        )

        # Create customer cart.
        self.cart = Cart.objects.create(
            user=self.customer,
        )

    def add_product_to_cart(self, quantity=1):
        # Add product to customer cart.
        return CartItem.objects.create(
            cart=self.cart,
            product=self.product,
            quantity=quantity,
        )

    def order_payload(self, coupon=None):
        # Build order payload.
        payload = {
            "shipping_name": "Test Customer",
            "shipping_phone": "9876543210",
            "shipping_address": "123 Test Street",
            "shipping_city": "Delhi",
            "shipping_state": "Delhi",
            "shipping_country": "India",
            "shipping_postal_code": "110001",
            "notes": "",
        }

        if coupon:
            payload["coupon"] = coupon

        return payload

    def create_coupon(
        self,
        code="SAVE10",
        discount_type="PERCENTAGE",
        discount_value=Decimal("10.00"),
        minimum_order_amount=Decimal("0.00"),
        maximum_discount_amount=None,
        usage_limit=None,
        per_user_limit=1,
        is_active=True,
        start_date=None,
        end_date=None,
    ):
        # Create an active test coupon.
        now = timezone.now()

        if start_date is None:
            start_date = now - timedelta(
                minutes=5,
            )

        if end_date is None:
            end_date = now + timedelta(
                days=7,
            )

        return Coupon.objects.create(
            code=code,
            discount_type=discount_type,
            discount_value=discount_value,
            minimum_order_amount=minimum_order_amount,
            maximum_discount_amount=(
                maximum_discount_amount
            ),
            usage_limit=usage_limit,
            per_user_limit=per_user_limit,
            start_date=start_date,
            end_date=end_date,
            is_active=is_active,
        )

    # Test authenticated user can create an order.
    def test_authenticated_user_can_create_order(self):
        self.client.force_authenticate(
            user=self.customer,
        )

        self.add_product_to_cart(
            quantity=2,
        )

        response = self.client.post(
            "/api/orders/",
            self.order_payload(),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        order = Order.objects.get(
            id=response.data["id"],
        )

        self.assertEqual(
            order.user,
            self.customer,
        )

        self.assertEqual(
            order.subtotal,
            Decimal("2000.00"),
        )

        self.assertEqual(
            order.discount_amount,
            Decimal("0.00"),
        )

        self.assertEqual(
            order.total_amount,
            Decimal("2000.00"),
        )

        self.assertEqual(
            order.status,
            "PENDING",
        )

        self.assertEqual(
            order.payment_status,
            "PENDING",
        )

    # Test order creates order items.
    def test_order_creates_order_items(self):
        self.client.force_authenticate(
            user=self.customer,
        )

        self.add_product_to_cart(
            quantity=2,
        )

        response = self.client.post(
            "/api/orders/",
            self.order_payload(),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        order = Order.objects.get(
            id=response.data["id"],
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
            self.product.name,
        )

        self.assertEqual(
            item.sku,
            self.product.sku,
        )

        self.assertEqual(
            item.price,
            Decimal("1000.00"),
        )

        self.assertEqual(
            item.quantity,
            2,
        )

        self.assertEqual(
            item.total_price,
            Decimal("2000.00"),
        )

    # Test order reduces product stock.
    def test_order_reduces_product_stock(self):
        self.client.force_authenticate(
            user=self.customer,
        )

        self.add_product_to_cart(
            quantity=3,
        )

        response = self.client.post(
            "/api/orders/",
            self.order_payload(),
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

    # Test product becomes out of stock.
    def test_order_marks_product_out_of_stock(self):
        self.client.force_authenticate(
            user=self.customer,
        )

        self.product.stock = 2
        self.product.save(
            update_fields=[
                "stock",
                "updated_at",
            ],
        )

        self.add_product_to_cart(
            quantity=2,
        )

        response = self.client.post(
            "/api/orders/",
            self.order_payload(),
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

    # Test successful order clears cart.
    def test_order_clears_cart(self):
        self.client.force_authenticate(
            user=self.customer,
        )

        self.add_product_to_cart(
            quantity=2,
        )

        response = self.client.post(
            "/api/orders/",
            self.order_payload(),
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

    # Test empty cart cannot create order.
    def test_empty_cart_cannot_create_order(self):
        self.client.force_authenticate(
            user=self.customer,
        )

        response = self.client.post(
            "/api/orders/",
            self.order_payload(),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertIn(
            "cart",
            response.data["errors"],
        )

    # Test insufficient stock cannot create order.
    def test_insufficient_stock_cannot_create_order(self):
        self.client.force_authenticate(
            user=self.customer,
        )

        self.product.stock = 2
        self.product.save(
            update_fields=[
                "stock",
                "updated_at",
            ],
        )

        self.add_product_to_cart(
            quantity=3,
        )

        response = self.client.post(
            "/api/orders/",
            self.order_payload(),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertEqual(
            Order.objects.filter(
                user=self.customer,
            ).count(),
            0,
        )

        self.assertEqual(
            CartItem.objects.filter(
                cart=self.cart,
            ).count(),
            1,
        )

        self.product.refresh_from_db()

        self.assertEqual(
            self.product.stock,
            2,
        )

    # Test unauthenticated user cannot create order.
    def test_unauthenticated_user_cannot_create_order(self):
        response = self.client.post(
            "/api/orders/",
            self.order_payload(),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    # Test customer can list own orders.
    def test_customer_can_list_own_orders(self):
        self.client.force_authenticate(
            user=self.customer,
        )

        Order.objects.create(
            user=self.customer,
            order_number="ORD-CUSTOMER-001",
            subtotal=Decimal("1000.00"),
            discount_amount=Decimal("0.00"),
            shipping_cost=Decimal("0.00"),
            total_amount=Decimal("1000.00"),
            shipping_name="Test Customer",
            shipping_phone="9876543210",
            shipping_address="123 Test Street",
            shipping_city="Delhi",
            shipping_state="Delhi",
            shipping_country="India",
            shipping_postal_code="110001",
        )

        response = self.client.get(
            "/api/orders/",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["count"],
            1,
        )

    # Test customer cannot see another user's orders.
    def test_customer_cannot_see_other_users_orders(self):
        other_user = User.objects.create_user(
            username="other",
            email="other@example.com",
            password="TestPassword123!",
            role="CUSTOMER",
        )

        Order.objects.create(
            user=other_user,
            order_number="ORD-OTHER-001",
            subtotal=Decimal("1000.00"),
            discount_amount=Decimal("0.00"),
            shipping_cost=Decimal("0.00"),
            total_amount=Decimal("1000.00"),
            shipping_name="Other User",
            shipping_phone="9876543210",
            shipping_address="Other Street",
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

        self.assertEqual(
            response.data["count"],
            0,
        )

    # Test percentage coupon works during order creation.
    def test_order_can_use_percentage_coupon(self):
        self.client.force_authenticate(
            user=self.customer,
        )

        self.add_product_to_cart(
            quantity=2,
        )

        coupon = self.create_coupon(
            code="SAVE10",
            discount_type="PERCENTAGE",
            discount_value=Decimal("10.00"),
        )

        response = self.client.post(
            "/api/orders/",
            self.order_payload(
                coupon="SAVE10",
            ),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        order = Order.objects.get(
            id=response.data["id"],
        )

        self.assertEqual(
            order.coupon,
            coupon,
        )

        self.assertEqual(
            order.discount_amount,
            Decimal("200.00"),
        )

        self.assertEqual(
            order.total_amount,
            Decimal("1800.00"),
        )

        coupon.refresh_from_db()

        self.assertEqual(
            coupon.used_count,
            1,
        )

    # Test fixed coupon works during order creation.
    def test_order_can_use_fixed_coupon(self):
        self.client.force_authenticate(
            user=self.customer,
        )

        self.add_product_to_cart(
            quantity=2,
        )

        self.create_coupon(
            code="FLAT100",
            discount_type="FIXED",
            discount_value=Decimal("100.00"),
        )

        response = self.client.post(
            "/api/orders/",
            self.order_payload(
                coupon="FLAT100",
            ),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        order = Order.objects.get(
            id=response.data["id"],
        )

        self.assertEqual(
            order.discount_amount,
            Decimal("100.00"),
        )

        self.assertEqual(
            order.total_amount,
            Decimal("1900.00"),
        )

        coupon = Coupon.objects.get(
            code="FLAT100",
        )

        self.assertEqual(
            coupon.used_count,
            1,
        )

    # Test maximum discount amount is respected.
    def test_order_applies_maximum_coupon_discount(self):
        self.client.force_authenticate(
            user=self.customer,
        )

        self.add_product_to_cart(
            quantity=2,
        )

        self.create_coupon(
            code="CAP10",
            discount_type="PERCENTAGE",
            discount_value=Decimal("50.00"),
            maximum_discount_amount=Decimal(
                "100.00",
            ),
        )

        response = self.client.post(
            "/api/orders/",
            self.order_payload(
                coupon="CAP10",
            ),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        order = Order.objects.get(
            id=response.data["id"],
        )

        self.assertEqual(
            order.discount_amount,
            Decimal("100.00"),
        )

        self.assertEqual(
            order.total_amount,
            Decimal("1900.00"),
        )

    # Test invalid coupon cannot create order.
    def test_invalid_coupon_cannot_create_order(self):
        self.client.force_authenticate(
            user=self.customer,
        )

        self.add_product_to_cart(
            quantity=1,
        )

        response = self.client.post(
            "/api/orders/",
            self.order_payload(
                coupon="INVALID",
            ),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertIn(
            "coupon",
            response.data["errors"],
        )

        self.assertEqual(
            Order.objects.filter(
                user=self.customer,
            ).count(),
            0,
        )

    # Test expired coupon cannot create order.
    def test_expired_coupon_cannot_create_order(self):
        self.client.force_authenticate(
            user=self.customer,
        )

        self.add_product_to_cart(
            quantity=1,
        )

        now = timezone.now()

        self.create_coupon(
            code="EXPIRED",
            start_date=now - timedelta(
                days=2,
            ),
            end_date=now - timedelta(
                days=1,
            ),
        )

        response = self.client.post(
            "/api/orders/",
            self.order_payload(
                coupon="EXPIRED",
            ),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertEqual(
            Order.objects.filter(
                user=self.customer,
            ).count(),
            0,
        )

    # Test inactive coupon cannot create order.
    def test_inactive_coupon_cannot_create_order(self):
        self.client.force_authenticate(
            user=self.customer,
        )

        self.add_product_to_cart(
            quantity=1,
        )

        self.create_coupon(
            code="INACTIVE",
            is_active=False,
        )

        response = self.client.post(
            "/api/orders/",
            self.order_payload(
                coupon="INACTIVE",
            ),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    # Test future coupon cannot create order.
    def test_future_coupon_cannot_create_order(self):
        self.client.force_authenticate(
            user=self.customer,
        )

        self.add_product_to_cart(
            quantity=1,
        )

        now = timezone.now()

        self.create_coupon(
            code="FUTURE",
            start_date=now + timedelta(
                days=1,
            ),
            end_date=now + timedelta(
                days=2,
            ),
        )

        response = self.client.post(
            "/api/orders/",
            self.order_payload(
                coupon="FUTURE",
            ),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    # Test coupon minimum order amount.
    def test_coupon_minimum_order_amount_is_enforced(self):
        self.client.force_authenticate(
            user=self.customer,
        )

        self.add_product_to_cart(
            quantity=1,
        )

        self.create_coupon(
            code="MIN5000",
            minimum_order_amount=Decimal(
                "5000.00",
            ),
        )

        response = self.client.post(
            "/api/orders/",
            self.order_payload(
                coupon="MIN5000",
            ),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertEqual(
            Order.objects.filter(
                user=self.customer,
            ).count(),
            0,
        )

    # Test coupon global usage limit.
    def test_coupon_usage_limit_is_enforced(self):
        self.client.force_authenticate(
            user=self.customer,
        )

        self.add_product_to_cart(
            quantity=1,
        )

        coupon = self.create_coupon(
            code="LIMIT1",
            usage_limit=1,
        )

        coupon.used_count = 1

        coupon.save(
            update_fields=[
                "used_count",
                "updated_at",
            ],
        )

        response = self.client.post(
            "/api/orders/",
            self.order_payload(
                coupon="LIMIT1",
            ),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertEqual(
            Order.objects.filter(
                user=self.customer,
            ).count(),
            0,
        )

    # Test coupon per-user usage limit.
    def test_coupon_per_user_limit_is_enforced(self):
        self.client.force_authenticate(
            user=self.customer,
        )

        coupon = self.create_coupon(
            code="USERLIMIT",
            per_user_limit=1,
        )

        Order.objects.create(
            user=self.customer,
            order_number="ORD-COUPON-001",
            subtotal=Decimal("1000.00"),
            discount_amount=Decimal("100.00"),
            shipping_cost=Decimal("0.00"),
            total_amount=Decimal("900.00"),
            coupon=coupon,
            shipping_name="Test Customer",
            shipping_phone="9876543210",
            shipping_address="123 Test Street",
            shipping_city="Delhi",
            shipping_state="Delhi",
            shipping_country="India",
            shipping_postal_code="110001",
        )

        self.add_product_to_cart(
            quantity=1,
        )

        response = self.client.post(
            "/api/orders/",
            self.order_payload(
                coupon="USERLIMIT",
            ),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertEqual(
            Order.objects.filter(
                user=self.customer,
                coupon=coupon,
            ).count(),
            1,
        )

    # Test failed order does not consume coupon usage.
    def test_coupon_usage_count_increments_only_after_successful_order(
        self,
    ):
        self.client.force_authenticate(
            user=self.customer,
        )

        coupon = self.create_coupon(
            code="ATOMIC",
            usage_limit=5,
        )

        self.add_product_to_cart(
            quantity=20,
        )

        response = self.client.post(
            "/api/orders/",
            self.order_payload(
                coupon="ATOMIC",
            ),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        coupon.refresh_from_db()

        self.assertEqual(
            coupon.used_count,
            0,
        )

        self.assertEqual(
            Order.objects.filter(
                user=self.customer,
            ).count(),
            0,
        )

    # Test coupon code is case insensitive.
    def test_coupon_is_case_insensitive_in_order(self):
        self.client.force_authenticate(
            user=self.customer,
        )

        self.add_product_to_cart(
            quantity=1,
        )

        coupon = self.create_coupon(
            code="SAVE20",
            discount_value=Decimal("20.00"),
        )

        response = self.client.post(
            "/api/orders/",
            self.order_payload(
                coupon="save20",
            ),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        order = Order.objects.get(
            id=response.data["id"],
        )

        self.assertEqual(
            order.coupon,
            coupon,
        )

    # Test new order has pending status.
    def test_new_order_has_pending_status(self):
        self.client.force_authenticate(
            user=self.customer,
        )

        self.add_product_to_cart()

        response = self.client.post(
            "/api/orders/",
            self.order_payload(),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        order = Order.objects.get(
            id=response.data["id"],
        )

        self.assertEqual(
            order.status,
            "PENDING",
        )

        self.assertEqual(
            order.payment_status,
            "PENDING",
        )

    # Test vendor can view vendor orders.
    def test_vendor_can_view_vendor_orders(self):
        order = Order.objects.create(
            user=self.customer,
            order_number="ORD-VENDOR-001",
            subtotal=Decimal("1000.00"),
            discount_amount=Decimal("0.00"),
            shipping_cost=Decimal("0.00"),
            total_amount=Decimal("1000.00"),
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

    # Test vendor can view vendor dashboard.
    def test_vendor_can_view_vendor_dashboard(self):
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

        self.assertIn(
            "stats",
            response.data,
        )

        self.assertIn(
            "recent_orders",
            response.data,
        )

    # Test customer cannot view vendor dashboard.
    def test_customer_cannot_view_vendor_dashboard(self):
        self.client.force_authenticate(
            user=self.customer,
        )

        response = self.client.get(
            "/api/orders/vendor-dashboard/",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    # Test customer cannot view vendor orders.
    def test_customer_cannot_view_vendor_orders(self):
        self.client.force_authenticate(
            user=self.customer,
        )

        response = self.client.get(
            "/api/orders/vendor-orders/",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    # Test admin can access order list.
    def test_admin_can_access_order_list(self):
        self.client.force_authenticate(
            user=self.admin,
        )

        response = self.client.get(
            "/api/orders/",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )