from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from django.core.validators import FileExtensionValidator

from .models import User

class RegisterSerializer(serializers.ModelSerializer):
    # Validate and hash the user's password
    password = serializers.CharField(
        write_only=True,
        min_length=8,
    )

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "password",
            "phone",
            "role",
        )
        read_only_fields = (
            "id",
            "role",
        )

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

    # Create a customer account with a hashed password
    def create(self, validated_data):
        validated_data.pop("role", None)

        password = validated_data.pop("password")

        user = User.objects.create_user(
            password=password,
            role="CUSTOMER",
            **validated_data
        )

        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(
        write_only=True,
    )

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
            ext = value.name.split('.')[-1].lower()
            if ext not in ['jpg', 'jpeg', 'png', 'webp']:
                raise serializers.ValidationError(
                    "Only jpg, jpeg, png, webp files allowed"
                )
        return value

class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(
        write_only=True
    )

    new_password = serializers.CharField(
        write_only=True,
        min_length=8
    )

    def validate_new_password(self, value):
        validate_password(value)
        return value