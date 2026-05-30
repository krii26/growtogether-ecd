# GrowTogether

GrowTogether is a Django + React app for early childhood development tracking.

## Core Features

- Child management
- Milestones tracking by category
- Activities and e-library resources
- Media upload support (child photos, milestone photos, library images)
- Google sign-in support
- Token-protected REST API with role-based access for parents, teachers, and admins
- Child risk assessment and follow-up workflows

## Project Structure

- `backend/` Django project configuration
- `ecd_app/` main Django app (models, serializers, views, urls)
- `ecd_frontend/` React frontend
- `media/` uploaded files

## Quick Start

## Environment Setup

Create local env files before running the app:

```bash
copy .env.example .env
copy ecd_frontend/.env.example ecd_frontend/.env
```

Important backend variables:

- `DJANGO_SECRET_KEY`
- `DJANGO_DEBUG`
- `DJANGO_ALLOWED_HOSTS`
- `CORS_ALLOWED_ORIGINS`
- `CSRF_TRUSTED_ORIGINS`
- `GOOGLE_CLIENT_ID`
- `DJANGO_LOG_LEVEL`
- `DRF_ANON_THROTTLE_RATE`
- `DRF_USER_THROTTLE_RATE`
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_HOST`
- `POSTGRES_PORT`
- `POSTGRES_SSLMODE`
- `USE_SQLITE` only if you want to force local SQLite fallback

Media storage selection variables:

- `USE_CLOUDINARY_MEDIA`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `USE_S3_MEDIA` (optional fallback if Cloudinary is disabled)
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_STORAGE_BUCKET_NAME`
- `AWS_S3_REGION_NAME`
- `AWS_S3_CUSTOM_DOMAIN` (optional)
- `AWS_MEDIA_LOCATION` (default `media`)
- `AWS_QUERYSTRING_AUTH`

Important frontend variables:

- `REACT_APP_API_BASE_URL`
- `REACT_APP_GOOGLE_CLIENT_ID`

### Backend

```bash
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Backend now uses PostgreSQL as the main database configuration. If you want to run against the local SQLite file instead, set `USE_SQLITE=1` before starting Django.

### Frontend

```bash
cd ecd_frontend
npm install
npm start
```

Open http://localhost:3000

### Store Media In Cloudinary (Recommended Free Tier)

The app supports Cloudinary storage for uploaded media (including e-library uploaded images).

1. Install dependencies:

```bash
pip install -r requirements.txt
```

2. In `.env`, set:

```bash
USE_CLOUDINARY_MEDIA=1
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# keep S3 disabled
USE_S3_MEDIA=0
```

3. Restart backend and verify new uploads resolve to Cloudinary URLs in API responses.

4. Existing local uploads are not auto-migrated. You can either:
- re-upload important files through the app/admin, or
- bulk upload with a one-time script/Cloudinary CLI.

### Store Media In AWS S3 (Optional)

S3 remains available if you want it later.

1. Install dependencies:

```bash
pip install -r requirements.txt
```

2. In `.env`, set:

```bash
USE_S3_MEDIA=1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_STORAGE_BUCKET_NAME=...
AWS_S3_REGION_NAME=...
AWS_MEDIA_LOCATION=media
AWS_QUERYSTRING_AUTH=0
```

3. Optional custom domain (CloudFront or bucket domain):

```bash
AWS_S3_CUSTOM_DOMAIN=cdn.example.com
```

4. Ensure Cloudinary is disabled for this mode:

```bash
USE_CLOUDINARY_MEDIA=0
```

5. Restart backend and verify new uploads resolve to S3 URLs in API responses.

6. Migrate existing local uploads to S3 (example):

```bash
aws s3 sync media/ s3://<your-bucket>/media/
```

7. If some e-library records use plain local path strings in the `image` field (not uploaded files), update those values to full S3 URLs so every image source is cloud-hosted.

## Quality Checks

Backend:

```bash
venv\Scripts\python.exe manage.py check
venv\Scripts\python.exe manage.py test
ruff check .
```

Frontend:

```bash
cd ecd_frontend
npm run lint
npm run test:ci
npm run build
```

## Security and Project Hygiene

- API endpoints require authentication by default.
- Role-based permissions are applied across the main REST resources.
- File uploads are constrained by size and allowed extensions.
- A health endpoint is available at `/health/`.
- Local media, backups, and generated assets are ignored in git for cleaner project history.

## Continuous Integration

GitHub Actions now runs backend checks, backend tests, frontend linting, frontend tests, and frontend production builds on each push and pull request.

## Notes

- Uploaded images are stored under `media/`.
- Google sign-in setup is in `GOOGLE_AUTH_SETUP.md`.
- If you plan to publish this repository, remove any already-tracked local artifacts such as database snapshots, uploaded media, and backup files from git history.
