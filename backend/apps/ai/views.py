from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .service import ask_ai


class AIChatView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        message = request.data.get("message", "").strip()

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
            print("AI CHAT ERROR:", error)

            return Response(
                {
                    "success": False,
                    "message": "AI service is temporarily unavailable.",
                },
                status=500,
            )