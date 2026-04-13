# Google Sign-In Setup (From Scratch)

This guide configures Google authentication for the GrowTogether project using your Google Cloud project.

## 1) Open Google Cloud Auth

Use this page:
https://console.cloud.google.com/auth/overview?project=resonant-petal-493206-h3

## 2) Configure OAuth Consent Screen

1. In Google Cloud, open APIs & Services > OAuth consent screen.
2. User type:
   - External (for normal Google accounts), then Create.
3. Fill required fields:
   - App name: GrowTogether
   - User support email: your email
   - Developer contact email: your email
4. Save and continue.
5. Scopes:
   - Keep default basic scopes for sign-in.
6. Test users (if app is in testing):
   - Add your Gmail account.
7. Save.

## 3) Create OAuth Client ID (Web)

1. Open APIs & Services > Credentials.
2. Click Create Credentials > OAuth client ID.
3. Application type: Web application.
4. Name: GrowTogether Web Client.
5. Authorized JavaScript origins:
   - http://localhost:3000
   - http://127.0.0.1:3000
6. Authorized redirect URIs:
   - You can leave empty for current Google Identity credential flow.
7. Click Create.
8. Copy the Client ID.

## 4) Frontend Environment Variable

Create or update this file:
ecd_frontend/.env

Add this line:
REACT_APP_GOOGLE_CLIENT_ID=YOUR_NEW_CLIENT_ID.apps.googleusercontent.com

Notes:
- Do not wrap the value in quotes.
- Restart frontend after changing .env.

## 5) Backend Environment Variable (PowerShell)

From project root, set env var before running Django:

$env:GOOGLE_CLIENT_ID="YOUR_NEW_CLIENT_ID.apps.googleusercontent.com"
python manage.py runserver

Important:
- This value must match frontend client id exactly.
- If you open a new terminal window, set it again unless you persist it.

## 6) Start Frontend

From ecd_frontend folder:

npm start

## 7) Test Google Login

1. Open the app login page.
2. Click Sign in with Google.
3. Choose your Google account.
4. Confirm you are redirected to dashboard.

## 8) If It Fails, Check These

1. Browser console says Google not configured:
   - Verify ecd_frontend/.env has REACT_APP_GOOGLE_CLIENT_ID.
   - Restart frontend.
2. Backend returns invalid token:
   - Ensure backend GOOGLE_CLIENT_ID equals frontend REACT_APP_GOOGLE_CLIENT_ID.
3. Origin error from Google:
   - Add your local URL in Authorized JavaScript origins.
4. Consent screen restriction:
   - Add your account as Test user while app is in testing mode.

## 9) Production Checklist

1. Add production domain to Authorized JavaScript origins.
2. Move env values to deployment secrets (do not hardcode).
3. Keep OAuth consent screen information accurate.
