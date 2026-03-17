import os
import json
from pathlib import Path

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
import django
django.setup()

from subscriptions.models import SubscriptionTier

tiers = []
for t in SubscriptionTier.objects.all():
    tiers.append({'id': t.id, 'name': t.name, 'paypal_plan_id': t.paypal_plan_id, 'max_usage': t.max_usage, 'price': str(t.price)})

print(json.dumps(tiers))
