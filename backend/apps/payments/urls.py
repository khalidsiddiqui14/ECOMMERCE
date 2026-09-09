from django.urls import path
from .views import PaymentCreateView, PaymentDetailView, verify_razorpay_payment

urlpatterns = [
    # Fix: Test expects POST to /api/payments/ (root), not just /api/payments/create/
    path("", PaymentCreateView.as_view(), name="payment-create-root"),
    path("create/", PaymentCreateView.as_view(), name="payment-create"),
    path("<int:pk>/", PaymentDetailView.as_view(), name="payment-detail"),
    path("verify/", verify_razorpay_payment, name="payment-verify"),
]