from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.db import transaction
from rest_framework import serializers

from apps.vendors.models import Vendor

from .models import User


class RegisterSerializer(serializers.ModelSerializer):
    # Validate and hash the user's password
    password = serializers.CharField(
        write_only=True,
        min_length=8,
    )

    profile_image = serializers.ImageField(
        required=False,
        allow_null=True,
    )

    role = serializers.ChoiceField(
        choices=(
            ("CUSTOMER", "Customer"),
            ("VENDOR", "Vendor"),
        ),
        default="CUSTOMER",
        required=False,
    )

    business_name = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=255,
    )

    vendor_phone = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=15,
    )

    gst_number = serializers.CharField(
        required=False,
        allow_blank=True,
        allow_null=True,
        max_length=30,
    )

    business_address = serializers.CharField(
        required=False,
        allow_blank=True,
    )

    business_city = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=100,
    )

    business_state = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=100,
    )

    business_country = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=100,
    )

    business_postal_code = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=20,
    )

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "password",
            "phone",
            "profile_image",
            "role",
            "business_name",
            "vendor_phone",
            "gst_number",
            "business_address",
            "business_city",
            "business_state",
            "business_country",
            "business_postal_code",
        )
        read_only_fields = (
            "id",
        )

    # Validate and normalize registration role
    def validate_role(self, value):
        value = str(value or "CUSTOMER").strip().upper()

        if value not in ("CUSTOMER", "VENDOR"):
            raise serializers.ValidationError(
                "Only Customer or Vendor registration is allowed."
            )

        return value

    # Validate the password against Django password validators
    def validate_password(self, value):
        validate_password(value)
        return value

    # Validate email uniqueness
    def validate_email(self, value):
        value = value.strip().lower()

        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                "A user with this email already exists."
            )

        return value

    # Validate phone uniqueness
    def validate_phone(self, value):
        if value:
            value = value.strip()

            if User.objects.filter(phone=value).exists():
                raise serializers.ValidationError(
                    "A user with this phone number already exists."
                )

        return value

    # Validate the profile image
    def validate_profile_image(self, value):
        if value:
            if value.size > 2 * 1024 * 1024:
                raise serializers.ValidationError(
                    "Profile image size must be less than 2MB."
                )

            if value.content_type not in (
                "image/jpeg",
                "image/png",
                "image/webp",
            ):
                raise serializers.ValidationError(
                    "Only JPG, JPEG, PNG, and WEBP images are allowed."
                )

        return value

    # Validate vendor information
    def validate(self, attrs):
        role = attrs.get("role", "CUSTOMER")

        if role == "VENDOR":
            required_fields = {
                "business_name": "Business name is required.",
                "vendor_phone": "Business phone is required.",
                "business_address": "Business address is required.",
                "business_city": "Business city is required.",
                "business_state": "Business state is required.",
                "business_country": "Business country is required.",
                "business_postal_code": "Business postal code is required.",
            }

            errors = {}

            for field, message in required_fields.items():
                value = attrs.get(field)

                if value is None or not str(value).strip():
                    errors[field] = message

            if errors:
                raise serializers.ValidationError(errors)

            vendor_phone = str(attrs.get("vendor_phone", "")).strip()

            if not vendor_phone.isdigit():
                raise serializers.ValidationError({
                    "vendor_phone": "Business phone must contain only numbers."
                })

            if len(vendor_phone) < 10 or len(vendor_phone) > 15:
                raise serializers.ValidationError({
                    "vendor_phone": "Business phone must contain 10 to 15 digits."
                })

            if Vendor.objects.filter(phone=vendor_phone).exists():
                raise serializers.ValidationError({
                    "vendor_phone": "A vendor with this phone number already exists."
                })

            gst_number = attrs.get("gst_number")

            if gst_number:
                gst_number = str(gst_number).strip().upper()

                if Vendor.objects.filter(gst_number=gst_number).exists():
                    raise serializers.ValidationError({
                        "gst_number": "A vendor with this GST number already exists."
                    })

                attrs["gst_number"] = gst_number
            else:
                attrs["gst_number"] = None

        return attrs

    # Create customer or vendor account
    @transaction.atomic
    def create(self, validated_data):
        role = validated_data.pop("role", "CUSTOMER")

        business_name = validated_data.pop("business_name", "")
        vendor_phone = validated_data.pop("vendor_phone", "")
        gst_number = validated_data.pop("gst_number", None) or None
        business_address = validated_data.pop("business_address", "")
        business_city = validated_data.pop("business_city", "")
        business_state = validated_data.pop("business_state", "")
        business_country = validated_data.pop("business_country", "")
        business_postal_code = validated_data.pop("business_postal_code", "")

        password = validated_data.pop("password")

        user = User.objects.create_user(
            password=password,
            role=role,
            **validated_data
        )

        if role == "VENDOR":
            Vendor.objects.create(
                user=user,
                business_name=business_name.strip(),
                phone=vendor_phone.strip(),
                gst_number=gst_number,
                address=business_address.strip(),
                city=business_city.strip(),
                state=business_state.strip(),
                country=business_country.strip(),
                postal_code=business_postal_code.strip(),
                is_verified=False,
                is_active=True,
            )

        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get("email", "").strip().lower()
        password = attrs.get("password", "")
        request = self.context.get("request")

        user = authenticate(
            request=request,
            username=email,
            password=password,
        )

        if user is None:
            raise serializers.ValidationError(
                "Invalid email or password."
            )

        if not user.is_active:
            raise serializers.ValidationError(
                "This account is inactive."
            )

        attrs["user"] = user

        return attrs


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "phone",
            "profile_image",
            "role",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "email",
            "role",
            "created_at",
            "updated_at",
        )

    def validate_profile_image(self, value):
        if value:
            if value.size > 2 * 1024 * 1024:
                raise serializers.ValidationError(
                    "Profile image size must be less than 2MB"
                )

            ext = value.name.split(".")[-1].lower()

            if ext not in ["jpg", "jpeg", "png", "webp"]:
                raise serializers.ValidationError(
                    "Only jpg, jpeg, png, webp files allowed"
                )

        return value


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(
        write_only=True,
        min_length=8,
    )

    def validate_new_password(self, value):
        validate_password(value)
        return value