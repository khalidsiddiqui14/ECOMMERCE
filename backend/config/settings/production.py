from .base import *


# Disable debug mode in production
DEBUG = False


# Production hosts
ALLOWED_HOSTS = [
    host.strip()
    for host in os.environ.get(
        "DJANGO_ALLOWED_HOSTS",
        "",
    ).split(",")
    if host.strip()
]


# Production frontend origins
CORS_ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.environ.get(
        "CORS_ALLOWED_ORIGINS",
        "",
    ).split(",")
    if origin.strip()
]


# Trusted frontend origins for CSRF protection
CSRF_TRUSTED_ORIGINS = [
    origin.strip()
    for origin in os.environ.get(
        "CSRF_TRUSTED_ORIGINS",
        "",
    ).split(",")
    if origin.strip()
]


# Force HTTPS in production
SECURE_SSL_REDIRECT = True


# Secure session cookies
SESSION_COOKIE_SECURE = True


# Secure CSRF cookies
CSRF_COOKIE_SECURE = True


# Prevent browsers from guessing content types
SECURE_CONTENT_TYPE_NOSNIFF = True


# Enable HTTP Strict Transport Security
SECURE_HSTS_SECONDS = 31536000


# Apply HSTS to subdomains
SECURE_HSTS_INCLUDE_SUBDOMAINS = True


# Allow HSTS preload
SECURE_HSTS_PRELOAD = True


# Prevent clickjacking
X_FRAME_OPTIONS = "DENY"


# Render / reverse-proxy HTTPS configuration
SECURE_PROXY_SSL_HEADER = (
    "HTTP_X_FORWARDED_PROTO",
    "https",
)