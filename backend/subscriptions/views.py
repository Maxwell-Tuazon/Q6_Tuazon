from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import SubscriptionTier, UserSubscription
from .serializers import SubscriptionTierSerializer, UserSubscriptionSerializer


class TierListView(generics.ListAPIView):
    queryset = SubscriptionTier.objects.all()
    serializer_class = SubscriptionTierSerializer
    permission_classes = [permissions.AllowAny]


class SubscribeView(generics.CreateAPIView):
    serializer_class = UserSubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        tier_id = request.data.get('tier')
        tier = get_object_or_404(SubscriptionTier, pk=tier_id)
        sub = UserSubscription.objects.create(
            user=request.user,
            tier=tier,
            usage_left=tier.max_usage,
            is_active=True,
        )
        return Response(UserSubscriptionSerializer(sub).data, status=status.HTTP_201_CREATED)


class SubscriptionListAdminView(generics.ListAPIView):
    queryset = UserSubscription.objects.all().order_by('-subscribed_at')
    serializer_class = UserSubscriptionSerializer
    permission_classes = [permissions.IsAdminUser]
