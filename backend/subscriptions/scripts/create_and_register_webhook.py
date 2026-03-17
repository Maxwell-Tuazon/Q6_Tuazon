#!/usr/bin/env python3
import os
import sys
import requests
from pathlib import Path


def read_env(env_path: Path):
    data = {}
    if not env_path.exists():
        return data
    for line in env_path.read_text(encoding='utf-8').splitlines():
        line = line.strip()
        if not line or line.startswith('#'):
            continue
        if '=' not in line:
            continue
        k, v = line.split('=', 1)
        data[k.strip()] = v.strip()
    return data


def write_env(env_path: Path, data: dict):
    # Read existing lines and replace keys
    lines = []
    if env_path.exists():
        lines = env_path.read_text(encoding='utf-8').splitlines()
    out = []
    keys = set(data.keys())
    for line in lines:
        stripped = line.strip()
        if not stripped or stripped.startswith('#') or '=' not in line:
            out.append(line)
            continue
        k = line.split('=', 1)[0].strip()
        if k in data:
            out.append(f"{k}={data[k]}")
            keys.discard(k)
        else:
            out.append(line)
    for k in keys:
        out.append(f"{k}={data[k]}")
    env_path.write_text('\n'.join(out) + '\n', encoding='utf-8')


def paypal_base(mode: str):
    return 'https://api-m.paypal.com' if mode == 'live' else 'https://api-m.sandbox.paypal.com'


def get_access_token(client_id, secret, mode='sandbox'):
    url = f"{paypal_base(mode)}/v1/oauth2/token"
    r = requests.post(url, auth=(client_id, secret), data={'grant_type': 'client_credentials'})
    r.raise_for_status()
    return r.json().get('access_token')


def create_webhook(token, webhook_url, mode='sandbox'):
    url = f"{paypal_base(mode)}/v1/notifications/webhooks"
    headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}
    payload = {
        'url': webhook_url,
        'event_types': [
            {'name': 'BILLING.SUBSCRIPTION.CREATED'},
            {'name': 'BILLING.SUBSCRIPTION.ACTIVATED'},
            {'name': 'BILLING.SUBSCRIPTION.CANCELLED'},
            {'name': 'BILLING.SUBSCRIPTION.SUSPENDED'},
            {'name': 'PAYMENT.SALE.COMPLETED'},
            {'name': 'PAYMENT.CAPTURE.COMPLETED'},
        ]
    }
    # First check existing webhooks to avoid duplicate
    list_url = url
    lr = requests.get(list_url, headers=headers)
    if lr.status_code == 200:
        try:
            existing = lr.json().get('webhooks', [])
            for w in existing:
                if w.get('url') == webhook_url:
                    return w
        except Exception:
            pass

    r = requests.post(url, json=payload, headers=headers)
    try:
        r.raise_for_status()
    except Exception:
        # show body for debugging
        print('PayPal create webhook failed: status=', r.status_code)
        try:
            print('Response:', r.json())
        except Exception:
            print('Response text:', r.text)
        raise
    return r.json()


def main():
    if len(sys.argv) < 2:
        print('Usage: create_and_register_webhook.py <webhook_url>')
        sys.exit(2)
    webhook_url = sys.argv[1]
    env_path = Path(__file__).resolve().parents[2] / '.env'
    env = read_env(env_path)
    client = env.get('PAYPAL_CLIENT_ID') or os.getenv('PAYPAL_CLIENT_ID')
    secret = env.get('PAYPAL_SECRET') or os.getenv('PAYPAL_SECRET')
    mode = env.get('PAYPAL_MODE') or os.getenv('PAYPAL_MODE') or 'sandbox'
    if not client or not secret:
        print('PAYPAL_CLIENT_ID and PAYPAL_SECRET not found in backend/.env or environment')
        sys.exit(1)

    print('Obtaining PayPal access token...')
    token = get_access_token(client, secret, mode)
    print('Creating webhook...')
    resp = create_webhook(token, webhook_url, mode)
    webhook_id = resp.get('id')
    if webhook_id:
        print('Created webhook id=', webhook_id)
        write_env(env_path, {'PAYPAL_WEBHOOK_ID': webhook_id})
        print(f'Wrote PAYPAL_WEBHOOK_ID to {env_path}')
    else:
        print('Could not find id in response:', resp)


if __name__ == '__main__':
    main()
