from django.contrib import admin
from .models import SubscriptionTier, UserSubscription


@admin.register(SubscriptionTier)
class SubscriptionTierAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'max_usage')


@admin.register(UserSubscription)
class UserSubscriptionAdmin(admin.ModelAdmin):
    list_display = ('user', 'tier', 'usage_left', 'is_active', 'subscribed_at')
