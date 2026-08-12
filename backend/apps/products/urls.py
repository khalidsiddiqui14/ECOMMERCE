from rest_framework_nested import routers

from .views import ProductViewSet, ProductImageViewSet


router = routers.SimpleRouter()
router.register(
    "",
    ProductViewSet,
    basename="products",
)

products_router = routers.NestedSimpleRouter(
    router,
    "",
    lookup="product",
)

products_router.register(
    "images",
    ProductImageViewSet,
    basename="product-images",
)

urlpatterns = (
    router.urls +
    products_router.urls
)