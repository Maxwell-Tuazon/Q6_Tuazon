from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Set PayPal plan IDs for Basic/Pro/Enterprise tiers'

    def handle(self, *args, **options):
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
                self.stdout.write(self.style.SUCCESS(f'Updated {name} -> {pid}'))
            else:
                self.stdout.write(self.style.WARNING(f'Missing tier: {name}'))

        self.stdout.write(self.style.SUCCESS('Done.'))
