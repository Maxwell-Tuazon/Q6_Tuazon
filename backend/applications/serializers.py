from rest_framework import serializers
from .models import SellerApplication


class SellerApplicationSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = SellerApplication
        fields = ['id', 'user', 'user_email', 'status', 'decline_reason', 'created_at']
        read_only_fields = ['status', 'created_at', 'user_email']
