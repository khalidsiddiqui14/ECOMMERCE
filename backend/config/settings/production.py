from .base import *
import os

# Disable debug mode in production
DEBUG = False

# Production hosts - ENV se lega
ALLOWED_HOSTS = [
    host.strip()
    for host in os.environ.get(
        "DJANGO_ALLOWED_HOSTS",
        "ecommerce-2-6amy.onrender.com,.onrender.com",
    ).split(",")
    if host.strip()
]

# Production frontend origins - ENV se
CORS_ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.environ.get(
        "CORS_ALLOWED_ORIGINS",
        "https://frontend-gsdp.onrender.com",
    ).split(",")
    if origin.strip()
]

# Trusted frontend origins for CSRF
CSRF_TRUSTED_ORIGINS = [
    origin.strip()
    for origin in os.environ.get(
        "CSRF_TRUSTED_ORIGINS",
        "https://frontend-gsdp.onrender.com,https://ecommerce-2-6amy.onrender.com",
    ).split(",")
    if origin.strip()
]

# SECURITY: Render pe SSL redirect OFF rakho - Render khud handle karta hai
# True karoge to redirect loop hoga!
SECURE_SSL_REDIRECT = os.environ.get("SECURE_SSL_REDIRECT", "False") == "True"

# Secure cookies - Production me True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

# Extra security headers
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
X_FRAME_OPTIONS = "DENY"

# HSTS - 1 year
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# Render proxy
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

# CORS allow credentials
CORS_ALLOW_CREDENTIALS = True

# LOGGING for production
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
        },
    },
    "root": {
        "handlers": ["console"],
        "level": "INFO",
    },
}