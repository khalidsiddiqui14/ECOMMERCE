from io import BytesIO

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile

from PIL import Image

from rest_framework import status
from rest_framework.test import APITestCase

from apps.brands.models import Brand
from apps.categories.models import Category
from apps.products.models import Product, ProductImage
from apps.stores.models import Store
from apps.vendors.models import Vendor


User = get_user_model()


class ProductAPITestCase(APITestCase):

    # Create test users, vendor data and products
    def setUp(self):
        self.admin = User.objects.create_user(
            username="admin",
            email="admin@example.com",
            password="TestPassword123!",
            role="ADMIN",
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

        self.customer = User.objects.create_user(
            username="customer",
            email="customer@example.com",
            password="TestPassword123!",
            role="CUSTOMER",
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

        self.other_vendor = Vendor.objects.create(
            user=self.other_vendor_user,
            business_name="Other Vendor",
            phone="9000000002",
            address="Other Address",
            city="Mumbai",
            state="Maharashtra",
            country="India",
            postal_code="400001",
        )

        self.store = Store.objects.create(
            vendor=self.vendor,
            name="Test Store",
            slug="test-store",
            address="Test Store Address",
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
            price="4999.00",
            stock=10,
            status="PUBLISHED",
            is_active=True,
        )

        self.other_product = Product.objects.create(
            store=self.other_store,
            category=self.category,
            brand=self.brand,
            name="Bluetooth Speaker",
            slug="bluetooth-speaker",
            sku="BS-001",
            description="Test speaker",
            price="2499.00",
            stock=20,
            status="PUBLISHED",
            is_active=True,
        )

        self.draft_product = Product.objects.create(
            store=self.store,
            category=self.category,
            brand=self.brand,
            name="Draft Product",
            slug="draft-product",
            sku="DP-001",
            description="Draft product",
            price="1999.00",
            stock=5,
            status="DRAFT",
            is_active=True,
        )

        self.product_image = ProductImage.objects.create(
            product=self.product,
            is_primary=True,
        )

    # Create a valid test image for upload tests
    def create_test_image(self):
        image = Image.new(
            "RGB",
            (100, 100),
            "white",
        )

        image_file = BytesIO()

        image.save(
            image_file,
            format="JPEG",
        )

        image_file.seek(0)

        return SimpleUploadedFile(
            "test-image.jpg",
            image_file.read(),
            content_type="image/jpeg",
        )

    # Test public users can view published products
    def test_public_can_list_published_products(self):
        response = self.client.get(
            "/api/products/",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        product_names = [
            item["name"]
            for item in response.data["results"]
        ]

        self.assertIn(
            "Smart Watch",
            product_names,
        )

        self.assertNotIn(
            "Draft Product",
            product_names,
        )

    # Test admin can view all products
    def test_admin_can_list_all_products(self):
        self.client.force_authenticate(
            user=self.admin,
        )

        response = self.client.get(
            "/api/products/",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["count"],
            3,
        )

    # Test vendor can view only own products
    def test_vendor_can_view_only_own_products(self):
        self.client.force_authenticate(
            user=self.vendor_user,
        )

        response = self.client.get(
            "/api/products/",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        product_names = [
            item["name"]
            for item in response.data["results"]
        ]

        self.assertIn(
            "Smart Watch",
            product_names,
        )

        self.assertIn(
            "Draft Product",
            product_names,
        )

        self.assertNotIn(
            "Bluetooth Speaker",
            product_names,
        )

    # Test customer cannot create a product
    def test_customer_cannot_create_product(self):
        self.client.force_authenticate(
            user=self.customer,
        )

        response = self.client.post(
            "/api/products/",
            {
                "category": self.category.id,
                "brand": self.brand.id,
                "name": "New Product",
                "slug": "new-product",
                "sku": "NP-001",
                "description": "New product",
                "price": "999.00",
                "stock": 10,
                "status": "DRAFT",
                "is_active": True,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    # Test unauthenticated users cannot create products
    def test_unauthenticated_user_cannot_create_product(self):
        response = self.client.post(
            "/api/products/",
            {
                "category": self.category.id,
                "brand": self.brand.id,
                "name": "New Product",
                "slug": "new-product",
                "sku": "NP-001",
                "description": "New product",
                "price": "999.00",
                "stock": 10,
                "status": "DRAFT",
                "is_active": True,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    # Test vendor can create a product
    def test_vendor_can_create_product(self):
        self.client.force_authenticate(
            user=self.vendor_user,
        )

        response = self.client.post(
            "/api/products/",
            {
                "category": self.category.id,
                "brand": self.brand.id,
                "name": "New Headphones",
                "slug": "new-headphones",
                "sku": "NH-001",
                "description": "New headphones",
                "price": "1999.00",
                "stock": 15,
                "status": "DRAFT",
                "is_active": True,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        product = Product.objects.get(
            slug="new-headphones",
        )

        self.assertEqual(
            product.store,
            self.store,
        )

    # Test admin can create a product
    def test_admin_can_create_product(self):
        self.client.force_authenticate(
            user=self.admin,
        )

        response = self.client.post(
            "/api/products/",
            {
                "store": self.store.id,
                "category": self.category.id,
                "brand": self.brand.id,
                "name": "Admin Product",
                "slug": "admin-product",
                "sku": "AP-001",
                "description": "Admin product",
                "price": "2999.00",
                "stock": 10,
                "status": "PUBLISHED",
                "is_active": True,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        product = Product.objects.get(
            slug="admin-product",
        )

        self.assertEqual(
            product.store,
            self.store,
        )

    # Test vendor can update own product
    def test_vendor_can_update_own_product(self):
        self.client.force_authenticate(
            user=self.vendor_user,
        )

        response = self.client.patch(
            f"/api/products/{self.product.id}/",
            {
                "price": "3999.00",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.product.refresh_from_db()

        self.assertEqual(
            str(self.product.price),
            "3999.00",
        )

    # Test vendor cannot update another vendor product
    def test_vendor_cannot_update_other_vendor_product(self):
        self.client.force_authenticate(
            user=self.vendor_user,
        )

        response = self.client.patch(
            f"/api/products/{self.other_product.id}/",
            {
                "price": "1.00",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

    # Test vendor cannot change product store
    def test_vendor_cannot_change_product_store(self):
        self.client.force_authenticate(
            user=self.vendor_user,
        )

        response = self.client.patch(
            f"/api/products/{self.product.id}/",
            {
                "store": self.other_store.id,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.product.refresh_from_db()

        self.assertEqual(
            self.product.store_id,
            self.store.id,
        )

    # Test vendor can delete own product
    def test_vendor_can_delete_own_product(self):
        self.client.force_authenticate(
            user=self.vendor_user,
        )

        product_id = self.product.id

        response = self.client.delete(
            f"/api/products/{product_id}/",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_204_NO_CONTENT,
        )

        self.assertFalse(
            Product.objects.filter(
                id=product_id,
            ).exists()
        )

    # Test vendor cannot delete another vendor product
    def test_vendor_cannot_delete_other_vendor_product(self):
        self.client.force_authenticate(
            user=self.vendor_user,
        )

        product_id = self.other_product.id

        response = self.client.delete(
            f"/api/products/{product_id}/",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

        self.assertTrue(
            Product.objects.filter(
                id=product_id,
            ).exists()
        )

    # Test unauthenticated users cannot delete products
    def test_unauthenticated_user_cannot_delete_product(self):
        response = self.client.delete(
            f"/api/products/{self.product.id}/",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    # Test admin can delete a product
    def test_admin_can_delete_product(self):
        self.client.force_authenticate(
            user=self.admin,
        )

        response = self.client.delete(
            f"/api/products/{self.product.id}/",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_204_NO_CONTENT,
        )

        self.assertFalse(
            Product.objects.filter(
                id=self.product.id,
            ).exists()
        )

    # Test negative price is rejected
    def test_negative_price_is_rejected(self):
        self.client.force_authenticate(
            user=self.vendor_user,
        )

        response = self.client.post(
            "/api/products/",
            {
                "category": self.category.id,
                "brand": self.brand.id,
                "name": "Invalid Product",
                "slug": "invalid-product",
                "sku": "IP-001",
                "description": "Invalid product",
                "price": "-100.00",
                "stock": 10,
                "status": "DRAFT",
                "is_active": True,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    # Test negative stock is rejected
    def test_negative_stock_is_rejected(self):
        self.client.force_authenticate(
            user=self.vendor_user,
        )

        response = self.client.post(
            "/api/products/",
            {
                "category": self.category.id,
                "brand": self.brand.id,
                "name": "Invalid Stock Product",
                "slug": "invalid-stock-product",
                "sku": "ISP-001",
                "description": "Invalid stock",
                "price": "999.00",
                "stock": -5,
                "status": "DRAFT",
                "is_active": True,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    # Test vendor cannot upload image to another vendor product
    def test_vendor_cannot_upload_image_to_other_vendor_product(self):
        self.client.force_authenticate(
            user=self.vendor_user,
        )

        response = self.client.post(
            f"/api/products/{self.other_product.id}/images/",
            {
                "image": self.create_test_image(),
                "is_primary": False,
            },
            format="multipart",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    # Test customer cannot upload product images
    def test_customer_cannot_upload_product_image(self):
        self.client.force_authenticate(
            user=self.customer,
        )

        response = self.client.post(
            f"/api/products/{self.product.id}/images/",
            {
                "image": self.create_test_image(),
                "is_primary": False,
            },
            format="multipart",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    # Test public users can view published product images
    def test_public_can_list_product_images(self):
        response = self.client.get(
            f"/api/products/{self.product.id}/images/",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["count"],
            1,
        )

    # Test product list pagination
    def test_product_list_is_paginated(self):
        for index in range(11):
            Product.objects.create(
                store=self.store,
                category=self.category,
                brand=self.brand,
                name=f"Pagination Product {index}",
                slug=f"pagination-product-{index}",
                sku=f"PG-{index:03d}",
                description="Pagination test product",
                price="999.00",
                stock=10,
                status="PUBLISHED",
                is_active=True,
            )

        response = self.client.get(
            "/api/products/",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["count"],
            13,
        )

        self.assertEqual(
            len(response.data["results"]),
            10,
        )

        response = self.client.get(
            "/api/products/?page=2",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            len(response.data["results"]),
            3,
        )

    # Test product search
    def test_product_search(self):
        response = self.client.get(
            "/api/products/?search=Smart Watch",
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
            response.data["results"][0]["name"],
            "Smart Watch",
        )

    # Test product filtering by status
    def test_product_filter_by_status(self):
        self.client.force_authenticate(
            user=self.admin,
        )

        response = self.client.get(
            "/api/products/?status=DRAFT",
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
            response.data["results"][0]["name"],
            "Draft Product",
        )

    # Test product ordering by price
    def test_product_ordering_by_price(self):
        response = self.client.get(
            "/api/products/?ordering=price",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        prices = [
            item["price"]
            for item in response.data["results"]
        ]

        self.assertEqual(
            prices,
            sorted(prices),
        )