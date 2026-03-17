from django.core.management.base import BaseCommand
import os
import requests
from subscriptions.models import SubscriptionTier


def paypal_base():
    mode = os.getenv('PAYPAL_MODE', 'sandbox')
    return 'https://api-m.paypal.com' if mode == 'live' else 'https://api-m.sandbox.paypal.com'


def get_paypal_token():
    client = os.getenv('PAYPAL_CLIENT_ID')
    secret = os.getenv('PAYPAL_SECRET')
    if not client or not secret:
        raise RuntimeError('Set PAYPAL_CLIENT_ID and PAYPAL_SECRET environment variables')
    url = f"{paypal_base()}/v1/oauth2/token"
    r = requests.post(url, auth=(client, secret), data={'grant_type': 'client_credentials'})
    r.raise_for_status()
    return r.json().get('access_token')


class Command(BaseCommand):
    help = 'Create PayPal product and subscription plans for tiers and save plan IDs to SubscriptionTier.paypal_plan_id'

    def handle(self, *args, **options):
        token = get_paypal_token()
        headers = {'Content-Type': 'application/json', 'Authorization': f'Bearer {token}'}

        # Create a product representing the chatbot subscriptions
        prod_payload = {
            'name': 'Chatbot Subscriptions',
            'description': 'Subscription plans for chatbot usage',
            'type': 'SERVICE',
            'category': 'SOFTWARE'
        }
        prod_url = f"{paypal_base()}/v1/catalogs/products"
        r = requests.post(prod_url, json=prod_payload, headers=headers)
        r.raise_for_status()
        product = r.json()
        product_id = product.get('id')
        self.stdout.write(self.style.SUCCESS(f'Created product id={product_id}'))

        # Define desired tiers
        desired = [
            {'name': 'Basic', 'price': '5.00', 'max_usage': 100},
            {'name': 'Pro', 'price': '15.00', 'max_usage': 1000},
            {'name': 'Enterprise', 'price': '49.00', 'max_usage': 10000},
        ]

        for d in desired:
            plan_payload = {
                'product_id': product_id,
                'name': f"{d['name']} Plan",
                'description': f"{d['name']} monthly subscription",
                'billing_cycles': [
                    {
                        'frequency': {'interval_unit': 'MONTH', 'interval_count': 1},
                        'tenure_type': 'REGULAR',
                        'sequence': 1,
                        'total_cycles': 0,
                        'pricing_scheme': {
                            'fixed_price': {'value': d['price'], 'currency_code': 'USD'}
                        }
                    }
                ],
                'payment_preferences': {
                    'auto_bill_outstanding': True,
                    'setup_fee': {'value': '0', 'currency_code': 'USD'},
                    'setup_fee_failure_action': 'CANCEL',
                    'payment_failure_threshold': 3
                }
            }
            plan_url = f"{paypal_base()}/v1/billing/plans"
            pr = requests.post(plan_url, json=plan_payload, headers=headers)
            pr.raise_for_status()
            plan = pr.json()
            plan_id = plan.get('id')
            self.stdout.write(self.style.SUCCESS(f'Created plan {d["name"]} id={plan_id}'))

            # Create or update SubscriptionTier locally
            tier, created = SubscriptionTier.objects.get_or_create(name=d['name'], defaults={'price': d['price'], 'max_usage': d['max_usage'], 'paypal_plan_id': plan_id})
            if not created:
                tier.price = d['price']
                tier.max_usage = d['max_usage']
                tier.paypal_plan_id = plan_id
                tier.save()
            self.stdout.write(self.style.SUCCESS(f'Synced tier {tier.name} (id={tier.id}) paypal_plan_id={plan_id}'))

        self.stdout.write(self.style.SUCCESS('All plans created and synced.'))
