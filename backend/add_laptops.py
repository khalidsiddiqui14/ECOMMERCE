import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.products.models import Product, Category
from apps.stores.models import Store
from django.utils.text import slugify
import uuid

cat_laptop, _ = Category.objects.get_or_create(name="Laptop")
store = Store.objects.first()
print(f"Category ID: {cat_laptop.id} | Store: {store.name}")

laptops = [
    ("HP Pavilion 15 Gaming Laptop", 62990, "Intel i5 12th Gen, 16GB RAM, 512GB SSD, RTX 3050"),
    ("Lenovo IdeaPad Slim 3", 42990, "Intel i5 11th Gen, 8GB RAM, 512GB SSD"),
    ("ASUS VivoBook 15", 38990, "AMD Ryzen 5, 8GB RAM, 512GB SSD"),
    ("Dell Inspiron 15 3520", 54990, "Intel i5 12th Gen, 16GB RAM, 512GB SSD"),
    ("Apple MacBook Air M2", 99900, "Apple M2 Chip, 8GB RAM, 256GB SSD"),
    ("Acer Nitro V Gaming Laptop", 74990, "Intel i5 13th Gen, 16GB RAM, 1TB SSD, RTX 4050"),
]

for name, price, desc in laptops:
    if Product.objects.filter(name=name).exists():
        print(f"Already {name}")
        continue
    
    base_slug = slugify(name)
    slug = base_slug
    counter = 1
    while Product.objects.filter(slug=slug).exists():
        slug = f"{base_slug}-{counter}"
        counter += 1

    # Generate unique SKU
    sku = f"SKU-{slugify(name)[:10].upper()}-{uuid.uuid4().hex[:4].upper()}"
    while Product.objects.filter(sku=sku).exists():
        sku = f"SKU-{slugify(name)[:10].upper()}-{uuid.uuid4().hex[:4].upper()}"

    Product.objects.create(
        name=name,
        slug=slug,
        sku=sku,
        price=price,
        description=desc,
        category=cat_laptop,
        store=store,
        stock=10,
        is_active=True
    )
    print(f"Added {name} -> {sku}")

print("DONE! Total laptops:", Product.objects.filter(category=cat_laptop).count())