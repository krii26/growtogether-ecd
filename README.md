# GrowTogether

GrowTogether is a Django + React app for early childhood development tracking.

## Core Features

- Child management
- Milestones tracking by category
- Activities and e-library resources
- Media upload support (child photos, milestone photos, library images)
- Google sign-in support

## Project Structure

- `backend/` Django project configuration
- `ecd_app/` main Django app (models, serializers, views, urls)
- `ecd_frontend/` React frontend
- `media/` uploaded files

## Quick Start

### Backend

```bash
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend

```bash
cd ecd_frontend
npm install
npm start
```

Open http://localhost:3000

## Notes

- Uploaded images are stored under `media/`.
- Google sign-in setup is in `GOOGLE_AUTH_SETUP.md`.
