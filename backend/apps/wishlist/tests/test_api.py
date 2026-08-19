from django.contrib.auth import get_user_model

from rest_framework import status
from rest_framework.test import APITestCase

from apps.brands.models import Brand
from apps.categories.models import Category
from apps.products.models import Product
from apps.stores.models import Store
from apps.vendors.models import Vendor

from apps.wishlist.models import Wishlist, WishlistItem


User = get_user_model()


class WishlistAPITestCase(APITestCase):

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

        self.wishlist = Wishlist.objects.create(
            user=self.customer,
        )

    # Test unauthenticated users cannot access wishlist
    def test_unauthenticated_user_cannot_access_wishlist(self):
        response = self.client.get(
            "/api/wishlist/",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    # Test authenticated user can view their wishlist
    def test_user_can_view_own_wishlist(self):
        self.client.force_authenticate(
            user=self.customer,
        )

        response = self.client.get(
            "/api/wishlist/",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["user"],
            self.customer.id,
        )

    # Test wishlist is created automatically
    def test_wishlist_is_created_automatically(self):
        self.client.force_authenticate(
            user=self.other_customer,
        )

        self.assertFalse(
            Wishlist.objects.filter(
                user=self.other_customer,
            ).exists()
        )

        response = self.client.get(
            "/api/wishlist/",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertTrue(
            Wishlist.objects.filter(
                user=self.other_customer,
            ).exists()
        )

    # Test user can add product to wishlist
    def test_user_can_add_product_to_wishlist(self):
        self.client.force_authenticate(
            user=self.customer,
        )

        response = self.client.post(
            "/api/wishlist/",
            {
                "product": self.product.id,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertTrue(
            WishlistItem.objects.filter(
                wishlist=self.wishlist,
                product=self.product,
            ).exists()
        )

    # Test duplicate product cannot be added
    def test_duplicate_product_cannot_be_added(self):
        WishlistItem.objects.create(
            wishlist=self.wishlist,
            product=self.product,
        )

        self.client.force_authenticate(
            user=self.customer,
        )

        response = self.client.post(
            "/api/wishlist/",
            {
                "product": self.product.id,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertEqual(
            WishlistItem.objects.filter(
                wishlist=self.wishlist,
                product=self.product,
            ).count(),
            1,
        )

    # Test inactive product cannot be added
    def test_inactive_product_cannot_be_added(self):
        self.product.is_active = False

        self.product.save(
            update_fields=[
                "is_active",
            ],
        )

        self.client.force_authenticate(
            user=self.customer,
        )

        response = self.client.post(
            "/api/wishlist/",
            {
                "product": self.product.id,
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
            update_fields=[
                "status",
            ],
        )

        self.client.force_authenticate(
            user=self.customer,
        )

        response = self.client.post(
            "/api/wishlist/",
            {
                "product": self.product.id,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    # Test out-of-stock published product can be added
    def test_out_of_stock_product_can_be_added(self):
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
            "/api/wishlist/",
            {
                "product": self.product.id,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    # Test user can remove wishlist item
    def test_user_can_remove_wishlist_item(self):
        self.client.force_authenticate(
            user=self.customer,
        )

        item = WishlistItem.objects.create(
            wishlist=self.wishlist,
            product=self.product,
        )

        response = self.client.delete(
            f"/api/wishlist/{item.id}/",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertFalse(
            WishlistItem.objects.filter(
                id=item.id,
            ).exists()
        )

    # Test user cannot remove another user's wishlist item
    def test_user_cannot_remove_other_users_item(self):
        other_wishlist = Wishlist.objects.create(
            user=self.other_customer,
        )

        item = WishlistItem.objects.create(
            wishlist=other_wishlist,
            product=self.product,
        )

        self.client.force_authenticate(
            user=self.customer,
        )

        response = self.client.delete(
            f"/api/wishlist/{item.id}/",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

        self.assertTrue(
            WishlistItem.objects.filter(
                id=item.id,
            ).exists()
        )

    # Test wishlist returns product details
    def test_wishlist_returns_product_details(self):
        WishlistItem.objects.create(
            wishlist=self.wishlist,
            product=self.product,
        )

        self.client.force_authenticate(
            user=self.customer,
        )

        response = self.client.get(
            "/api/wishlist/",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            len(response.data["items"]),
            1,
        )

        item = response.data["items"][0]

        self.assertEqual(
            item["product"],
            self.product.id,
        )

        self.assertEqual(
            item["product_name"],
            "Smart Watch",
        )

        self.assertEqual(
            item["price"],
            "4999.00",
        )

    # Test wishlist belongs only to its user
    def test_wishlist_is_user_specific(self):
        WishlistItem.objects.create(
            wishlist=self.wishlist,
            product=self.product,
        )

        other_wishlist = Wishlist.objects.create(
            user=self.other_customer,
        )

        WishlistItem.objects.create(
            wishlist=other_wishlist,
            product=self.second_product,
        )

        self.client.force_authenticate(
            user=self.customer,
        )

        response = self.client.get(
            "/api/wishlist/",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            len(response.data["items"]),
            1,
        )

        self.assertEqual(
            response.data["items"][0]["product"],
            self.product.id,
        )