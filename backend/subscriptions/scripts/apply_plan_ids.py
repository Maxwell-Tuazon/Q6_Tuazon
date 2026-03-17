import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
import django
django.setup()

from subscriptions.models import SubscriptionTier

mapping = {
    'Basic': 'P-2EN05913TG392902YNG4YTOQ',
    'Pro': 'P-2BU67616FB707844BNG4YTOY',
    'Enterprise': 'P-0NH2559077874741LNG4YTPI',
}

for name, pid in mapping.items():
    t = SubscriptionTier.objects.filter(name=name).first()
    if t:
        t.paypal_plan_id = pid
        t.save()
        print('Updated', name, pid)
    else:
        print('Missing tier', name)

print('\nAll tiers now:')
for t in SubscriptionTier.objects.all():
    print(t.id, t.name, t.paypal_plan_id, t.max_usage)
