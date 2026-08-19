from .base import *

# Enable debug mode for local development
DEBUG = True

# Allow local development hosts
ALLOWED_HOSTS = [
    "localhost",
    "127.0.0.1",
    "backend",
]

# Allow the local React development server
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
]