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
                {'name': 'Basic', 'price': '5.00', 'max_usage': 5},
                {'name': 'Pro', 'price': '15.00', 'max_usage': 10},
                {'name': 'Enterprise', 'price': '49.00', 'max_usage': 15},
            ]
            for d in defaults:
                SubscriptionTier.objects.create(name=d['name'], price=d['price'], max_usage=d['max_usage'])
            qs = self.get_queryset()
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)


class ActivateSubscriptionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        sub_id = request.data.get('subscription_id')
        plan_id = request.data.get('plan_id')
        if not sub_id:
            return Response({'error': 'subscription_id required'}, status=status.HTTP_400_BAD_REQUEST)

        # Try to find tier by plan_id first, then by provided tier id in request
        tier = None
        if plan_id:
            tier = SubscriptionTier.objects.filter(paypal_plan_id=plan_id).first()

        # fallback: if client sent tier id
        if not tier:
            tier_id = request.data.get('tier')
            if tier_id:
                tier = SubscriptionTier.objects.filter(pk=tier_id).first()

        # If still no tier, pick Basic as safe default
        if not tier:
            tier = SubscriptionTier.objects.filter(name__in=['Basic', 'Pro', 'Enterprise']).first()

        us = UserSubscription.objects.create(
            user=request.user,
            tier=tier,
            paypal_subscription_id=sub_id,
            usage_left=(tier.max_usage if tier else 0),
            is_active=True,
        )
        serializer = UserSubscriptionSerializer(us)
        return Response(serializer.data)


from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse, HttpResponse


@csrf_exempt
def paypal_webhook(request):
    # Minimal webhook receiver for demo: log and accept
    try:
        import json
        body = json.loads(request.body.decode('utf-8')) if request.body else {}
    except Exception:
        body = {}
    # Ideally verify signature here using PayPal API; for demo accept and update subscription status
    event_type = body.get('event_type') if isinstance(body, dict) else None
    resource = body.get('resource') if isinstance(body, dict) else {}
    if event_type in ('BILLING.SUBSCRIPTION.CANCELLED', 'BILLING.SUBSCRIPTION.SUSPENDED'):
        sub_id = resource.get('id')
        if sub_id:
            UserSubscription.objects.filter(paypal_subscription_id=sub_id).update(is_active=False)
    return JsonResponse({'status': 'ok'})


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
