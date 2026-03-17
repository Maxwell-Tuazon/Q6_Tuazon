from django.urls import path
from .views import TierListView, SubscribeView, SubscriptionListAdminView

urlpatterns = [
    path('tiers/', TierListView.as_view(), name='tiers'),
    path('subscribe/', SubscribeView.as_view(), name='subscribe'),
    path('list/', SubscriptionListAdminView.as_view(), name='subscription-list-admin'),
]
