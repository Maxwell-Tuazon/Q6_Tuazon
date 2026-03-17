import sqlite3
from pathlib import Path
import json

db_path = Path(__file__).resolve().parents[2] / 'db.sqlite3'
if not db_path.exists():
    print('DB not found at', db_path)
    raise SystemExit(1)

con = sqlite3.connect(str(db_path))
cur = con.cursor()
try:
    cur.execute('SELECT id, name, paypal_plan_id, max_usage, price FROM subscriptions_subscriptiontier')
    rows = cur.fetchall()
    out = []
    for r in rows:
        out.append({'id': r[0], 'name': r[1], 'paypal_plan_id': r[2], 'max_usage': r[3], 'price': str(r[4]) if r[4] is not None else None})
    print(json.dumps(out))
finally:
    cur.close()
    con.close()
