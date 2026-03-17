from django.db import models
from django.conf import settings
from django.utils import timezone


class SubscriptionTier(models.Model):
    name = models.CharField(max_length=100)
    paypal_plan_id = models.CharField(max_length=255, blank=True, null=True)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    max_usage = models.IntegerField(default=1000)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name


class UserSubscription(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='subscriptions')
    tier = models.ForeignKey(SubscriptionTier, on_delete=models.SET_NULL, null=True)
    usage_left = models.IntegerField(default=0)
    is_active = models.BooleanField(default=False)
    subscribed_at = models.DateTimeField(null=True, blank=True)
    paypal_subscription_id = models.CharField(max_length=255, blank=True, null=True)
    payer_id = models.CharField(max_length=255, blank=True, null=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    def activate(self, usage=None):
        self.is_active = True
        self.subscribed_at = timezone.now()
        if usage is None and self.tier:
            self.usage_left = self.tier.max_usage
        elif usage is not None:
            self.usage_left = usage
        self.save()

    def __str__(self):
        return f"{getattr(self.user, 'email', str(self.user))} - {self.tier}"
