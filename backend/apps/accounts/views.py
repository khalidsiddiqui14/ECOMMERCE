from drf_spectacular.utils import extend_schema
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.throttling import AnonRateThrottle
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
from django.core.cache import cache
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail

from .models import User, OTP
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer, ChangePasswordSerializer
from .utils import send_otp_email, send_otp_sms
import random
import hmac


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class LoginView(APIView):
    serializer_class = LoginSerializer
    permission_classes = [permissions.AllowAny]

    @extend_schema(request=LoginSerializer, responses=LoginSerializer)
    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]

        if not user.is_active:
            return Response({"detail": "This account is inactive."}, status=400)

        refresh = RefreshToken.for_user(user)

        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": UserSerializer(user).data,
        })


class ProfileView(APIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(responses=UserSerializer)
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    @extend_schema(request=UserSerializer, responses=UserSerializer)
    def put(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class ChangePasswordView(APIView):
    serializer_class = ChangePasswordSerializer
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(request=ChangePasswordSerializer, responses={200: None})
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user

        if not user.check_password(serializer.validated_data["current_password"]):
            return Response({"detail": "Current password is incorrect."}, status=400)

        user.set_password(serializer.validated_data["new_password"])
        user.save(update_fields=["password"])

        return Response({"detail": "Password changed successfully."})


class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = str(request.data.get("email", "")).strip().lower()

        if not email:
            return Response({"success": False, "message": "Email is required."}, status=400)

        user = User.objects.filter(email__iexact=email).first()

        if not user:
            return Response({"success": True, "message": "If an account exists with this email, a reset link has been sent."})

        if not user.is_active:
            return Response({"success": False, "message": "This account is inactive."}, status=403)

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:5173")
        reset_link = f"{frontend_url}/reset-password/{uid}/{token}/"

        try:
            send_mail(
                "Reset your ShopZone password",
                f"Use this link to reset your password:\n\n{reset_link}",
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=False,
            )
        except Exception:
            return Response({"success": False, "message": "Unable to send password reset email."}, status=500)

        response = {"success": True, "message": "Password reset link has been sent to your email."}

        if settings.DEBUG:
            response["reset_link"] = reset_link

        return Response(response)


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        uid = str(request.data.get("uid", "")).strip()
        token = str(request.data.get("token", "")).strip()
        new_password = str(request.data.get("new_password", ""))

        if not uid or not token or not new_password:
            return Response({"success": False, "message": "UID, token and new password are required."}, status=400)

        if len(new_password) < 8:
            return Response({"success": False, "message": "Password must be at least 8 characters."}, status=400)

        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({"success": False, "message": "Invalid password reset link."}, status=400)

        if not default_token_generator.check_token(user, token):
            return Response({"success": False, "message": "Password reset link is invalid or expired."}, status=400)

        user.set_password(new_password)
        user.save(update_fields=["password"])

        return Response({"success": True, "message": "Password reset successfully. You can now login."})


# ================= SECURE OTP FEATURES - HACKER PROOF =================

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {"refresh": str(refresh), "access": str(refresh.access_token)}


@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([AnonRateThrottle])
def send_otp(request):
    identifier = request.data.get("email_or_phone", "").strip()

    if not identifier:
        return Response({"success": False, "message": "Please enter email or phone number!"}, status=400)

    ip = request.META.get("REMOTE_ADDR", "")
    ip_key = f"otp_ip_{ip}"
    ip_count = cache.get(ip_key, 0)

    if ip_count >= 10:
        return Response({"success": False, "message": "Too many requests from this IP! Try after 1 hour"}, status=429)

    cache_key = f"otp_limit_{identifier}"
    count = cache.get(cache_key, 0)

    if count >= 3:
        return Response({"success": False, "message": "Too many OTP requests! Try after 5 minutes"}, status=429)

    OTP.objects.filter(email_or_phone=identifier, is_used=False).update(is_used=True)

    otp_code = OTP.generate_otp()
    OTP.objects.create(email_or_phone=identifier, otp_code=otp_code, attempts=0, is_used=False)

    cache.set(cache_key, count + 1, 300)
    cache.set(ip_key, ip_count + 1, 3600)

    is_email = "@" in identifier

    if is_email:
        send_otp_email(identifier, otp_code)
        masked = identifier[0:2] + "***" + identifier[identifier.find("@"):] if len(identifier) > 5 else "***" + identifier[identifier.find("@"):]
        msg = f"OTP sent to email {masked}"
    else:
        send_otp_sms(identifier, otp_code)
        masked = "****" + identifier[-4:] if len(identifier) >= 4 else "****"
        msg = f"OTP sent to phone {masked}"

    response_data = {"success": True, "message": msg, "identifier": identifier}

    if settings.DEBUG:
        response_data["test_otp"] = otp_code
        print(f"[DEBUG OTP] {identifier} -> {otp_code}")

    return Response(response_data)


@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([AnonRateThrottle])
def verify_otp(request):
    identifier = request.data.get("email_or_phone", "").strip()
    otp_input = request.data.get("otp", "").strip()

    if not identifier or not otp_input:
        return Response({"success": False, "message": "Email/Phone and OTP required!"}, status=400)

    otp_obj = OTP.objects.filter(email_or_phone=identifier, is_used=False).last()

    if not otp_obj:
        return Response({"success": False, "message": "No OTP found or already used! Please send OTP first!"}, status=400)

    if otp_obj.is_expired():
        otp_obj.is_used = True
        otp_obj.save()
        return Response({"success": False, "message": "OTP expired! Please send new OTP."}, status=400)

    if otp_obj.attempts >= 3:
        otp_obj.is_used = True
        otp_obj.save()
        return Response({"success": False, "message": "Too many wrong attempts! Request new OTP"}, status=400)

    if not hmac.compare_digest(str(otp_obj.otp_code), str(otp_input)):
        otp_obj.attempts += 1
        otp_obj.save()
        return Response({"success": False, "message": f"Invalid OTP! {3 - otp_obj.attempts} tries left"}, status=400)

    otp_obj.is_verified = True
    otp_obj.is_used = True
    otp_obj.save()

    cache.delete(f"otp_limit_{identifier}")

    is_email = "@" in identifier

    if is_email:
        user, created = User.objects.get_or_create(
            email=identifier,
            defaults={"email": identifier, "username": identifier.split("@")[0] + str(random.randint(100, 9999))}
        )
    else:
        user, created = User.objects.get_or_create(
            phone=identifier,
            defaults={"phone": identifier, "email": f"{identifier}@phone.shopzone.com", "username": f"user_{identifier[-10:]}_{random.randint(10, 99)}"}
        )

    if not user.is_active:
        return Response({"success": False, "message": "This account is inactive. Please contact an administrator."}, status=403)

    tokens = get_tokens_for_user(user)

    return Response({
        "success": True,
        "message": "Login Successful! 🎉",
        "user": UserSerializer(user).data,
        "tokens": tokens,
        "is_new_user": created
    })


@api_view(["POST"])
@permission_classes([AllowAny])
def google_login(request):
    from google.oauth2 import id_token
    from google.auth.transport import requests as google_requests

    token = request.data.get("token", "").strip()

    if not token:
        return Response({"success": False, "message": "Google token required!"}, status=400)

    try:
        GOOGLE_CLIENT_ID = settings.GOOGLE_CLIENT_ID
        idinfo = id_token.verify_oauth2_token(token, google_requests.Request(), GOOGLE_CLIENT_ID)
        email = idinfo["email"]
        name = idinfo.get("name", "")

        user, created = User.objects.get_or_create(
            email=email,
            defaults={"email": email, "username": email.split("@")[0] + str(random.randint(100, 9999)), "first_name": name}
        )

        if not user.is_active:
            return Response({"success": False, "message": "This account is inactive."}, status=403)

        tokens = get_tokens_for_user(user)

        return Response({
            "success": True,
            "message": "Google Login Successful! 🎉",
            "user": UserSerializer(user).data,
            "tokens": tokens,
            "is_new_user": created
        })

    except Exception as e:
        return Response({"success": False, "message": f"Google login failed: {str(e)}"}, status=400)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_view(request):
    try:
        refresh_token = request.data.get("refresh")

        if not refresh_token:
            return Response({"success": False, "message": "Refresh token required"}, status=400)

        token = RefreshToken(refresh_token)
        token.blacklist()

        return Response({"success": True, "message": "Logged out successfully"})
    except Exception as e:
        return Response({"success": False, "message": f"Logout failed: {str(e)}"}, status=400)