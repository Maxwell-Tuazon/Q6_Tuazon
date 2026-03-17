from rest_framework import serializers
from .models import SellerApplication
from users.serializers import UserSerializer


class SellerApplicationSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = SellerApplication
        fields = ['id', 'user', 'user_email', 'message', 'status', 'decline_reason', 'created_at']
        read_only_fields = ['status', 'created_at', 'user_email', 'user']
