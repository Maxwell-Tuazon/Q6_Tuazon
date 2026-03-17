from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import SubscriptionTier, UserSubscription
from .serializers import SubscriptionTierSerializer, UserSubscriptionSerializer
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated


class TierListView(generics.ListAPIView):
    queryset = SubscriptionTier.objects.all()
    serializer_class = SubscriptionTierSerializer
    permission_classes = [permissions.AllowAny]

    def list(self, request, *args, **kwargs):
        qs = self.get_queryset()
        # If no tiers exist yet (fresh DB), create default tiers
        if not qs.exists():
            defaults = [
                {'name': 'Basic', 'price': '5.00', 'max_usage': 3},
                {'name': 'Plus', 'price': '9.00', 'max_usage': 5},
                {'name': 'Pro', 'price': '15.00', 'max_usage': 10},
            ]
            for d in defaults:
                SubscriptionTier.objects.create(name=d['name'], price=d['price'], max_usage=d['max_usage'])
            qs = self.get_queryset()
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)


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


class MySubscriptionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        sub = UserSubscription.objects.filter(user=request.user, is_active=True).order_by('-subscribed_at').first()
        if not sub:
            return Response({'detail': 'No active subscription'}, status=204)
        return Response(UserSubscriptionSerializer(sub).data)
