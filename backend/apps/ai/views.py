from drf_spectacular.utils import (
    OpenApiExample,
    OpenApiResponse,
    extend_schema,
)
from rest_framework import serializers
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .service import ask_ai


class AIChatRequestSerializer(serializers.Serializer):
    message = serializers.CharField(
        required=True,
        allow_blank=False,
    )


class AIChatResponseSerializer(serializers.Serializer):
    success = serializers.BooleanField()
    message = serializers.CharField()


class AIChatView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        request=AIChatRequestSerializer,
        responses={
            200: AIChatResponseSerializer,
            400: OpenApiResponse(
                description="Message is required.",
            ),
            500: OpenApiResponse(
                description=(
                    "AI service is temporarily unavailable."
                ),
            ),
        },
        examples=[
            OpenApiExample(
                "AI Chat Request",
                request_only=True,
                value={
                    "message": "What are the best products "
                    "for a new customer?"
                },
            ),
        ],
    )
    def post(self, request):
        message = request.data.get(
            "message",
            "",
        ).strip()

        if not message:
            return Response(
                {
                    "success": False,
                    "message": "Message is required.",
                },
                status=400,
            )

        try:
            answer = ask_ai(message)

            return Response(
                {
                    "success": True,
                    "message": answer,
                }
            )

        except Exception as error:
            print(
                "AI CHAT ERROR:",
                error,
            )

            return Response(
                {
                    "success": False,
                    "message": (
                        "AI service is temporarily unavailable."
                    ),
                },
                status=500,
            )