# Quiz_6

This repository contains a Django backend and a React frontend for the Quiz_6 project.

## Structure
- `backend/` — Django project (with `base` app)
- `frontend/` — React app

## Prerequisites
- Python 3.10+ (tested on 3.13)
- Node.js + npm
- Git

This README describes how to get the project running locally (backend + frontend).

## Backend setup
1. Create and activate a virtual environment (Windows example):

```powershell
cd backend
python -m venv myenv
myenv\Scripts\activate
```

2. Install Python dependencies:

```powershell
pip install -r ..\requirements.txt
```

3. Run migrations and start server:

```powershell
python manage.py migrate
python manage.py createsuperuser   # create an admin account when needed
python manage.py runserver
```

4. Environment variables

- To use the AI chat endpoint you should set `GEMINI_API_KEY` (example PowerShell):

```powershell
# temporary for this session
$env:GEMINI_API_KEY = "your_key_here"

# persistent (new shells after restart)
setx GEMINI_API_KEY "your_key_here"
```

Do NOT commit API keys into the repository. Keep them in OS env vars or a local `.env`.

4. API endpoints (examples):
- `GET /api/products/`
- `POST /api/users/login/` — returns JWT `refresh` and `access` tokens plus user fields

## Frontend setup

The frontend uses a `package-lock.json` to pin versions. We commit `frontend/package-lock.json` so you can run `npm ci` for deterministic installs.

```bash
cd frontend
# deterministic install using lockfile
npm ci
npm start
```

If you don't have `package-lock.json` for some reason, use `npm install` to generate it.

Open http://localhost:3000 to view the React app.

## Environment variables
Create a `.env` file (not committed) or set environment variables for:
- `SECRET_KEY`
- `DEBUG` (True/False)
- `DATABASE_URL` (optional if using a different DB)
- `GEMINI_API_KEY` (for AI chatbot)

## Git
Add and commit changes:

```bash
git init
git add .
git commit -m "Initial commit"
# add remote and push
# git remote add origin <url>
# git push -u origin main
```

## Notes
- `requirements.txt` pins core backend packages. You may want to run `pip freeze > requirements.txt` in your activated venv to produce an exact list before sharing.
- The project uses `djangorestframework-simplejwt` for JWT authentication and `django-cors-headers` to allow the frontend to connect.

## Quick start (one-liners)

- Backend (Windows PowerShell):

```powershell
cd backend; python -m venv myenv; .\myenv\Scripts\Activate.ps1; pip install -r ..\requirements.txt; py manage.py migrate; py manage.py createsuperuser; py manage.py runserver
```

- Frontend (separate shell):

```bash
cd frontend; npm ci; npm start
```

If you plan to clone this repo on another machine, running the above backend and frontend steps will install the required Python and Node dependencies based on `requirements.txt` and `frontend/package-lock.json`.
