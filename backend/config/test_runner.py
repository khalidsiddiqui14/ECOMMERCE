import os

from django.test.runner import DiscoverRunner


class CustomTestRunner(DiscoverRunner):

    def build_suite(
        self,
        test_labels=None,
        extra_tests=None,
        **kwargs,
    ):
        if test_labels:
            return super().build_suite(
                test_labels,
                extra_tests=extra_tests,
                **kwargs,
            )

        suite = self.test_loader.loadTestsFromNames(
            [
                "apps.accounts.tests.test_api",
                "apps.vendors.tests.test_api",
                "apps.stores.tests.test_api",
                "apps.categories.tests.test_api",
                "apps.brands.tests.test_api",
                "apps.products.tests.test_api",
                "apps.cart.tests.test_api",
                "apps.wishlist.tests.test_api",
                "apps.orders.tests.test_api",
                "apps.payments.tests.test_api",
                "apps.reviews.tests.test_api",
                "apps.coupons.tests.test_api",
                "apps.notifications.tests.test_api",
                "apps.addresses.tests.test_api",
            ]
        )

        if extra_tests:
            for test in extra_tests:
                suite.addTest(test)

        return suite