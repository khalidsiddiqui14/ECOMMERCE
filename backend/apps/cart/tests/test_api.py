from django.contrib.auth import get_user_model

from rest_framework import status
from rest_framework.test import APITestCase

from apps.brands.models import Brand
from apps.categories.models import Category
from apps.products.models import Product
from apps.stores.models import Store
from apps.vendors.models import Vendor

from apps.cart.models import Cart, CartItem

User = get_user_model()


class CartAPITestCase(APITestCase):

    # Create test users, vendor data and products
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

        self.vendor = Vendor.objects.create(
            user=self.vendor_user,
            business_name="Test Vendor",
            phone="9000000001",
            address="Test Address",
            city="Delhi",
            state="Delhi",
            country="India",
            postal_code="110001",
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
            price="4999.00",
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
            description="Test speaker",
            price="2499.00",
            stock=5,
            status="PUBLISHED",
            is_active=True,
        )

        self.cart = Cart.objects.create(
            user=self.customer,
        )

    # Test unauthenticated users cannot access carts
    def test_unauthenticated_user_cannot_access_cart(self):
        response = self.client.get(
            "/api/cart/",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    # Test authenticated user can view their cart
    def test_user_can_view_own_cart(self):
        self.client.force_authenticate(
            user=self.customer,
        )

        response = self.client.get(
            "/api/cart/",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["user"],
            self.customer.id,
        )

    # Test cart is created automatically for authenticated user
    def test_cart_is_created_automatically(self):
        self.client.force_authenticate(
            user=self.other_customer,
        )

        self.assertFalse(
            Cart.objects.filter(
                user=self.other_customer,
            ).exists()
        )

        response = self.client.get(
            "/api/cart/",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertTrue(
            Cart.objects.filter(
                user=self.other_customer,
            ).exists()
        )

    # Test user can add product to cart
    def test_user_can_add_product_to_cart(self):
        self.client.force_authenticate(
            user=self.customer,
        )

        response = self.client.post(
            "/api/cart/",
            {
                "product": self.product.id,
                "quantity": 2,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        item = CartItem.objects.get(
            cart=self.cart,
            product=self.product,
        )

        self.assertEqual(
            item.quantity,
            2,
        )

    # Test adding same product increases quantity
    def test_adding_same_product_increases_quantity(self):
        self.client.force_authenticate(
            user=self.customer,
        )

        CartItem.objects.create(
            cart=self.cart,
            product=self.product,
            quantity=2,
        )

        response = self.client.post(
            "/api/cart/",
            {
                "product": self.product.id,
                "quantity": 3,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        item = CartItem.objects.get(
            cart=self.cart,
            product=self.product,
        )

        self.assertEqual(
            item.quantity,
            5,
        )

    # Test quantity cannot exceed available stock
    def test_quantity_cannot_exceed_stock(self):
        self.client.force_authenticate(
            user=self.customer,
        )

        response = self.client.post(
            "/api/cart/",
            {
                "product": self.product.id,
                "quantity": 11,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertFalse(
            CartItem.objects.filter(
                cart=self.cart,
                product=self.product,
            ).exists()
        )

    # Test zero quantity is rejected
    def test_zero_quantity_is_rejected(self):
        self.client.force_authenticate(
            user=self.customer,
        )

        response = self.client.post(
            "/api/cart/",
            {
                "product": self.product.id,
                "quantity": 0,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    # Test negative quantity is rejected
    def test_negative_quantity_is_rejected(self):
        self.client.force_authenticate(
            user=self.customer,
        )

        response = self.client.post(
            "/api/cart/",
            {
                "product": self.product.id,
                "quantity": -1,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    # Test invalid quantity is rejected
    def test_invalid_quantity_is_rejected(self):
        self.client.force_authenticate(
            user=self.customer,
        )

        response = self.client.post(
            "/api/cart/",
            {
                "product": self.product.id,
                "quantity": "abc",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    # Test inactive product cannot be added
    def test_inactive_product_cannot_be_added(self):
        self.product.is_active = False
        self.product.save(
            update_fields=["is_active"],
        )

        self.client.force_authenticate(
            user=self.customer,
        )

        response = self.client.post(
            "/api/cart/",
            {
                "product": self.product.id,
                "quantity": 1,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    # Test draft product cannot be added
    def test_draft_product_cannot_be_added(self):
        self.product.status = "DRAFT"
        self.product.save(
            update_fields=["status"],
        )

        self.client.force_authenticate(
            user=self.customer,
        )

        response = self.client.post(
            "/api/cart/",
            {
                "product": self.product.id,
                "quantity": 1,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    # Test out of stock product cannot be added
    def test_out_of_stock_product_cannot_be_added(self):
        self.product.stock = 0
        self.product.status = "OUT_OF_STOCK"

        self.product.save(
            update_fields=[
                "stock",
                "status",
            ],
        )

        self.client.force_authenticate(
            user=self.customer,
        )

        response = self.client.post(
            "/api/cart/",
            {
                "product": self.product.id,
                "quantity": 1,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    # Test user can update cart item quantity
    def test_user_can_update_cart_item(self):
        self.client.force_authenticate(
            user=self.customer,
        )

        item = CartItem.objects.create(
            cart=self.cart,
            product=self.product,
            quantity=2,
        )

        response = self.client.put(
            f"/api/cart/{item.id}/",
            {
                "quantity": 5,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        item.refresh_from_db()

        self.assertEqual(
            item.quantity,
            5,
        )

    # Test user cannot update another user's cart item
    def test_user_cannot_update_other_users_cart_item(self):
        other_cart = Cart.objects.create(
            user=self.other_customer,
        )

        item = CartItem.objects.create(
            cart=other_cart,
            product=self.product,
            quantity=2,
        )

        self.client.force_authenticate(
            user=self.customer,
        )

        response = self.client.put(
            f"/api/cart/{item.id}/",
            {
                "quantity": 5,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

    # Test updated quantity cannot exceed stock
    def test_updated_quantity_cannot_exceed_stock(self):
        self.client.force_authenticate(
            user=self.customer,
        )

        item = CartItem.objects.create(
            cart=self.cart,
            product=self.product,
            quantity=2,
        )

        response = self.client.put(
            f"/api/cart/{item.id}/",
            {
                "quantity": 11,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        item.refresh_from_db()

        self.assertEqual(
            item.quantity,
            2,
        )

    # Test user can remove cart item
    def test_user_can_remove_cart_item(self):
        self.client.force_authenticate(
            user=self.customer,
        )

        item = CartItem.objects.create(
            cart=self.cart,
            product=self.product,
            quantity=2,
        )

        response = self.client.delete(
            f"/api/cart/{item.id}/",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertFalse(
            CartItem.objects.filter(
                id=item.id,
            ).exists()
        )

    # Test user cannot remove another user's cart item
    def test_user_cannot_remove_other_users_cart_item(self):
        other_cart = Cart.objects.create(
            user=self.other_customer,
        )

        item = CartItem.objects.create(
            cart=other_cart,
            product=self.product,
            quantity=2,
        )

        self.client.force_authenticate(
            user=self.customer,
        )

        response = self.client.delete(
            f"/api/cart/{item.id}/",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

        self.assertTrue(
            CartItem.objects.filter(
                id=item.id,
            ).exists()
        )

    # Test cart total price is calculated correctly
    def test_cart_total_price_is_calculated_correctly(self):
        self.client.force_authenticate(
            user=self.customer,
        )

        CartItem.objects.create(
            cart=self.cart,
            product=self.product,
            quantity=2,
        )

        CartItem.objects.create(
            cart=self.cart,
            product=self.second_product,
            quantity=1,
        )

        response = self.client.get(
            "/api/cart/",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["total_price"],
            "12497.00",
        )

    # Test duplicate cart items are prevented
    def test_duplicate_cart_item_is_prevented(self):
        CartItem.objects.create(
            cart=self.cart,
            product=self.product,
            quantity=1,
        )

        self.client.force_authenticate(
            user=self.customer,
        )

        response = self.client.post(
            "/api/cart/",
            {
                "product": self.product.id,
                "quantity": 1,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertEqual(
            CartItem.objects.filter(
                cart=self.cart,
                product=self.product,
            ).count(),
            1,
        )