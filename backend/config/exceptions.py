from rest_framework import status
from rest_framework.exceptions import (
    APIException,
    AuthenticationFailed,
    NotAuthenticated,
    NotFound,
    PermissionDenied,
    ValidationError,
)
from rest_framework.response import Response
from rest_framework.views import exception_handler


def custom_exception_handler(exc, context):
    # Handle DRF exceptions
    response = exception_handler(exc, context)

    if response is not None:
        if isinstance(exc, ValidationError):
            message = "Validation failed."

        elif isinstance(
            exc,
            (
                AuthenticationFailed,
                NotAuthenticated,
            ),
        ):
            message = "Authentication failed."

        elif isinstance(exc, PermissionDenied):
            message = "Permission denied."

        elif isinstance(exc, NotFound):
            message = "Resource not found."

        elif isinstance(exc, APIException):
            message = str(
                getattr(
                    exc,
                    "default_detail",
                    "An API error occurred.",
                )
            )

        else:
            message = "An error occurred."

        error_data = response.data

        if isinstance(error_data, dict):
            detail = error_data.get("detail")

            if detail is not None:
                message = str(detail)
                errors = {}
            else:
                errors = error_data

        elif isinstance(error_data, list):
            errors = {
                "non_field_errors": error_data,
            }

        else:
            errors = {
                "non_field_errors": [
                    str(error_data),
                ],
            }

        response.data = {
            "success": False,
            "message": message,
            "errors": errors,
        }

        return response

    # Handle unexpected errors
    return Response(
        {
            "success": False,
            "message": "An unexpected server error occurred.",
            "errors": {},
        },
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )