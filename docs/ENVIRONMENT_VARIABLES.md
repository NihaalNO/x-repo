# Environment Variables Guide

This document lists all environment variables required for X-Repo to function properly.

## Frontend Environment Variables

Create a `.env` file in the `frontend/` directory with the following variables:

### Firebase Configuration (Required)

These are obtained from your Firebase project console.

| Variable | Description | Where to Find |
|----------|-------------|---------------|
| `VITE_FIREBASE_API_KEY` | Firebase API key | Firebase Console > Project Settings > General > Your apps > Web app config |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase authentication domain | Same as above (format: `project-id.firebaseapp.com`) |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID | Same as above |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | Same as above (format: `project-id.appspot.com`) |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | Same as above |
| `VITE_FIREBASE_APP_ID` | Firebase app ID | Same as above |

**How to get Firebase config:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)
3. Click the gear icon ⚙️ > Project Settings
4. Scroll down to "Your apps" section
5. Click the web icon `</>` to add a web app
6. Copy the configuration values

### Supabase Configuration (Required)

| Variable | Description | Where to Find |
|----------|-------------|---------------|
| `VITE_SUPABASE_URL` | Supabase project URL | Supabase Dashboard > Project Settings > API > Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous/public key | Supabase Dashboard > Project Settings > API > anon public key |

**How to get Supabase config:**
1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project (or create a new one)
3. Go to Settings > API
4. Copy the "Project URL" and "anon public" key

### API Configuration (Required)

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:8000/api` |

**Note:** Change this to your production API URL when deploying.

---

## Backend Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

### Firebase Admin SDK Configuration (Required)

You need **one** of the following options:

**Option 1: File Path (Recommended)**
| Variable | Description | Example |
|----------|-------------|---------|
| `FIREBASE_CREDENTIALS_PATH` | Path to Firebase service account JSON file | `./serviceAccountKey.json` |

**Option 2: JSON String**
| Variable | Description |
|----------|-------------|
| `FIREBASE_CREDENTIALS_JSON` | Complete service account JSON as a string |

**How to get Firebase Admin SDK credentials:**
1. Go to Firebase Console > Project Settings
2. Click on "Service Accounts" tab
3. Click "Generate new private key"
4. Save the JSON file securely (don't commit to git!)
5. Either:
   - Place it in the backend directory and set `FIREBASE_CREDENTIALS_PATH`
   - Or copy the JSON content and set `FIREBASE_CREDENTIALS_JSON` (escape quotes properly)

### Supabase Configuration (Required)

| Variable | Description | Where to Find |
|----------|-------------|---------------|
| `SUPABASE_URL` | Supabase project URL | Supabase Dashboard > Project Settings > API > Project URL |
| `SUPABASE_SERVICE_KEY` | Supabase service role key (recommended) | Supabase Dashboard > Project Settings > API > service_role key |
| `SUPABASE_ANON_KEY` | Supabase anonymous key (fallback) | Supabase Dashboard > Project Settings > API > anon public key |

**Note:** `SUPABASE_SERVICE_KEY` is preferred as it has full database access. Use `SUPABASE_ANON_KEY` only if service key is not available (less secure).

### Google Gemini API Configuration (Required for AI Features)

| Variable | Description | Where to Find |
|----------|-------------|---------------|
| `GEMINI_API_KEY` | Google Gemini API key | [Google AI Studio](https://ai.google.dev/) > Get API Key |

**How to get Gemini API key:**
1. Go to [Google AI Studio](https://ai.google.dev/)
2. Sign in with your Google account
3. Click "Get API Key"
4. Create a new API key or use an existing one
5. Copy the key

### CORS Configuration (Required)

| Variable | Description | Default |
|----------|-------------|---------|
| `ALLOWED_ORIGINS` | Comma-separated list of allowed frontend origins | `http://localhost:3000` |

**Examples:**
- Development: `http://localhost:3000,http://localhost:5173`
- Production: `https://yourdomain.com,https://www.yourdomain.com`

---

## Quick Setup Checklist

### Frontend Setup
- [ ] Create `.env` file in `frontend/` directory
- [ ] Add all `VITE_*` variables
- [ ] Get Firebase config from Firebase Console
- [ ] Get Supabase URL and anon key from Supabase Dashboard
- [ ] Set API base URL (default: `http://localhost:8000/api`)

### Backend Setup
- [ ] Create `.env` file in `backend/` directory
- [ ] Add Firebase Admin SDK credentials (file path or JSON)
- [ ] Get Supabase URL and service key from Supabase Dashboard
- [ ] Get Gemini API key from Google AI Studio
- [ ] Set allowed origins for CORS

---

## Security Notes

⚠️ **Important Security Guidelines:**

1. **Never commit `.env` files to git** - They contain sensitive credentials
2. **Use `.env.example` files** - These are safe to commit and serve as templates
3. **Firebase service account keys** - Keep these extremely secure, they have admin access
4. **Supabase service role key** - Has full database access, treat as a secret
5. **Gemini API key** - Has usage costs, protect it from unauthorized use
6. **Production deployment** - Use environment variables provided by your hosting platform (Vercel, Railway, etc.)

---

## Example .env Files

### Frontend `.env` Example
```env
VITE_FIREBASE_API_KEY=AIzaSyExample123456789
VITE_FIREBASE_AUTH_DOMAIN=my-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=my-project-id
VITE_FIREBASE_STORAGE_BUCKET=my-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abc123def456
VITE_SUPABASE_URL=https://abcdefgh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_API_BASE_URL=http://localhost:8000/api
```

### Backend `.env` Example
```env
FIREBASE_CREDENTIALS_PATH=./serviceAccountKey.json
SUPABASE_URL=https://abcdefgh.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
GEMINI_API_KEY=AIzaSyExample123456789
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

---

## Troubleshooting

### Frontend Issues

**Error: "Missing Supabase environment variables"**
- Check that `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
- Ensure variable names start with `VITE_` (required for Vite)

**Error: "Firebase app not initialized"**
- Verify all `VITE_FIREBASE_*` variables are set correctly
- Check Firebase Console to ensure the web app is created

### Backend Issues

**Error: "SUPABASE_URL and SUPABASE_KEY must be set"**
- Check that `SUPABASE_URL` is set
- Ensure either `SUPABASE_SERVICE_KEY` or `SUPABASE_ANON_KEY` is set

**Error: "Firebase Admin SDK initialization failed"**
- Verify `FIREBASE_CREDENTIALS_PATH` points to a valid JSON file
- Or check that `FIREBASE_CREDENTIALS_JSON` contains valid JSON
- Ensure the service account has proper permissions

**Error: "Gemini API key not configured"**
- Set `GEMINI_API_KEY` in your `.env` file
- Verify the API key is valid at [Google AI Studio](https://ai.google.dev/)

---

## Need Help?

If you're having trouble setting up environment variables:
1. Check the [Setup Guide](./SETUP.md) for detailed instructions
2. Verify all credentials are correct in their respective dashboards
3. Ensure `.env` files are in the correct directories
4. Restart your development servers after changing environment variables

