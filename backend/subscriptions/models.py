from django.db import models
from django.conf import settings


class SubscriptionTier(models.Model):
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    max_usage = models.IntegerField()

    def __str__(self):
        return f"{self.name} - {self.price}"


class UserSubscription(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    tier = models.ForeignKey(SubscriptionTier, on_delete=models.CASCADE)
    usage_left = models.IntegerField()
    is_active = models.BooleanField(default=True)
    subscribed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} - {self.tier.name} - active={self.is_active}"
