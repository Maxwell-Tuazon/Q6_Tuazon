# Quiz_6 — Pest & Wildlife Control App

This repository contains a Django backend and a React frontend for a small marketplace and AI chatbot service.

Contents
- `backend/` — Django project (APIs, subscriptions, orders)
- `frontend/` — React app (user UI, PayPal integration)

Prerequisites
- Python 3.10+
- Node.js + npm
- Git

Quick overview / Site flow
- Users register/login → purchase single services or subscribe to tiers.
- Subscriptions give a limited number of chatbot usages (5/10/15 for Basic/Pro/Enterprise).
- Payments: single purchases use PayPal Buttons on service pages; subscriptions use PayPal Subscriptions.
- PayPal webhooks update subscription state (cancel/suspend) server-side.

Backend setup (Windows example)
1. Open a shell and create/activate a venv inside `backend/`:

```powershell
cd backend
python -m venv myenv
.\myenv\Scripts\Activate.ps1
```

2. Install Python dependencies (root `requirements.txt` mirrors backend):

```powershell
pip install -r ../requirements.txt
```

3. Ensure migrations are applied and create a superuser if needed:

```powershell
py manage.py makemigrations
py manage.py migrate
py manage.py createsuperuser
```

4. Start the backend:

```powershell
py manage.py runserver
```

Environment variables
Create a `backend/.env` (not committed) or export these in your shell. Example keys used by the project:
- `SECRET_KEY` — Django secret key
- `DEBUG` — `True`/`False`
- `DATABASE_URL` — optional
- `PAYPAL_CLIENT_ID`, `PAYPAL_SECRET`, `PAYPAL_MODE` — PayPal sandbox credentials
- `PAYPAL_WEBHOOK_ID` — PayPal webhook ID (if registered)
- `GENAI_API_KEY` or `GEMINI_API_KEY` — API key for the AI chatbot

Do NOT commit secrets to the repo. Use OS env vars or a local `.env` file.

Frontend setup
1. Install and start the frontend (separate terminal):

```bash
cd frontend
npm ci
npm start
```

2. Open http://localhost:3000

Notes on development
- The frontend proxies API calls to `http://127.0.0.1:8000` (see `frontend/package.json` `proxy`).
- PayPal sandbox integration requires `REACT_APP_PAYPAL_CLIENT_ID` set in `frontend/.env`.
- To regenerate precise Python deps, activate the backend venv and run `pip freeze > requirements.txt`.

Migration & deployment checklist
- Run `makemigrations` and `migrate` after pulling changes.
- If adding models, create migrations and apply them before running the server.

Useful commands
- Backend (PowerShell):

```powershell
cd backend
.\myenv\Scripts\Activate.ps1
pip install -r ../requirements.txt
py manage.py makemigrations
py manage.py migrate
py manage.py runserver
```

- Frontend (bash/powershell):

```bash
cd frontend
npm ci
npm start
```

Support
- If the AI chatbot returns `AI call failed`, ensure `GENAI_API_KEY` is set and the `google-genai` package is installed in the backend virtualenv.

License & contribution
- This repo has no license file. Add one if you plan to open-source the project.

-- End of README
