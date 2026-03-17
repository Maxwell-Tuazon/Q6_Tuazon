try:
    from subscriptions.models import SubscriptionTier
except Exception:
    # try to configure Django when run as a script
    import os
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
    import django
    django.setup()
    from subscriptions.models import SubscriptionTier


def cleanup():
    print('Before:')
    for t in SubscriptionTier.objects.all():
        print(t.id, t.name, t.max_usage, t.paypal_plan_id)

    desired = ['Basic', 'Pro', 'Enterprise']
    for t in list(SubscriptionTier.objects.all()):
        if t.name not in desired:
            print('Deleting extra tier', t.id, t.name)
            t.delete()

    print('After:')
    for t in SubscriptionTier.objects.all():
        print(t.id, t.name, t.max_usage, t.paypal_plan_id)


if __name__ == '__main__':
    cleanup()
