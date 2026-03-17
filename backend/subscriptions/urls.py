from django.urls import path
from .views import (
    TierListView,
    SubscribeView,
    SubscriptionListAdminView,
    MySubscriptionView,
    ActivateSubscriptionView,
    paypal_webhook,
)

urlpatterns = [
    path('tiers/', TierListView.as_view(), name='tiers'),
    path('subscribe/', SubscribeView.as_view(), name='subscribe'),
    path('activate/', ActivateSubscriptionView.as_view(), name='activate'),
    path('list/', SubscriptionListAdminView.as_view(), name='subscription-list-admin'),
    path('me/', MySubscriptionView.as_view(), name='my-subscription'),
    path('webhook/', paypal_webhook, name='subscription-webhook'),
]
