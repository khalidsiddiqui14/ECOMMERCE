from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

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
    password = serializers.CharField(write_only=True)

    # Authenticate the user with email and password
    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        user = authenticate(
            username=email,
            password=password,
        )

        if not user:
            raise serializers.ValidationError(
                "Invalid email or password."
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