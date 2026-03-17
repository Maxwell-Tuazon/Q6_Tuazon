from rest_framework import serializers
from .models import SubscriptionTier, UserSubscription


class SubscriptionTierSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionTier
        fields = ['id', 'name', 'price', 'max_usage']


class UserSubscriptionSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)
    tier_name = serializers.CharField(source='tier.name', read_only=True)

    class Meta:
        model = UserSubscription
        fields = ['id', 'user', 'user_email', 'tier', 'tier_name', 'usage_left', 'is_active', 'subscribed_at']
        read_only_fields = ['user_email', 'tier_name', 'subscribed_at']
