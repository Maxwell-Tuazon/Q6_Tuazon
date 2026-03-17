import os
from django.db.models.signals import post_migrate
from django.dispatch import receiver


@receiver(post_migrate)
def ensure_subscription_tiers(sender, **kwargs):
    # only run for this app
    if sender.name != 'subscriptions':
        return
    try:
        from .models import SubscriptionTier
    except Exception:
        return

    # desired tiers and defaults
    defaults = [
        {'name': 'Basic', 'price': '5.00', 'max_usage': 5},
        {'name': 'Pro', 'price': '15.00', 'max_usage': 10},
        {'name': 'Enterprise', 'price': '49.00', 'max_usage': 15},
    ]

    # Plan IDs can be provided via environment variables to support different accounts
    env_plan_map = {
        'Basic': os.getenv('PAYPAL_PLAN_BASIC'),
        'Pro': os.getenv('PAYPAL_PLAN_PRO'),
        'Enterprise': os.getenv('PAYPAL_PLAN_ENTERPRISE'),
    }

    # Fallback plan IDs (created during development). These are sandbox IDs and may not work across accounts.
    fallback_plans = {
        'Basic': 'P-2EN05913TG392902YNG4YTOQ',
        'Pro': 'P-2BU67616FB707844BNG4YTOY',
        'Enterprise': 'P-0NH2559077874741LNG4YTPI',
    }

    for d in defaults:
        t, created = SubscriptionTier.objects.get_or_create(name=d['name'], defaults={'price': d['price'], 'max_usage': d['max_usage']})
        # ensure fields updated
        updated = False
        if t.max_usage != d['max_usage']:
            t.max_usage = d['max_usage']
            updated = True
        if str(t.price) != str(d['price']):
            t.price = d['price']
            updated = True

        # set paypal_plan_id from env if provided, otherwise leave existing or set fallback
        plan_from_env = env_plan_map.get(d['name'])
        if plan_from_env:
            if t.paypal_plan_id != plan_from_env:
                t.paypal_plan_id = plan_from_env
                updated = True
        else:
            # if no plan set, attempt to set fallback (idempotent)
            if not t.paypal_plan_id:
                t.paypal_plan_id = fallback_plans.get(d['name'])
                updated = True

        if updated:
            t.save()
