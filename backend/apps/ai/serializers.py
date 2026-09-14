from rest_framework import serializers

class AIChatRequestSerializer(serializers.Serializer):
    message = serializers.CharField(required=True, allow_blank=False, max_length=500)

class AIChatResponseSerializer(serializers.Serializer):
    success = serializers.BooleanField()
    message = serializers.CharField()