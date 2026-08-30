from .base import *


# Enable debug mode for local development
DEBUG = True


# Local development hosts
ALLOWED_HOSTS = [
    "localhost",
    "127.0.0.1",
    "backend",
]


# Local React development server
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
]


# Disable HTTPS enforcement locally
SECURE_SSL_REDIRECT = False


# Disable HSTS locally
SECURE_HSTS_SECONDS = 0

SECURE_HSTS_INCLUDE_SUBDOMAINS = False

SECURE_HSTS_PRELOAD = False


# Allow non-secure cookies locally
SESSION_COOKIE_SECURE = False

CSRF_COOKIE_SECURE = False