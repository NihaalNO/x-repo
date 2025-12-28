# X-Repo Setup Guide

This guide will help you set up X-Repo on your local machine.

## Prerequisites

1. **Node.js 18+** and npm
2. **Python 3.10+** and pip
3. **Firebase Account** - Create a project at https://console.firebase.google.com
4. **Supabase Account** - Create a project at https://supabase.com
5. **Google Gemini API Key** - Get from https://ai.google.dev/

## Step 1: Firebase Setup

1. Go to Firebase Console and create a new project
2. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable Email/Password, Google, and GitHub providers
3. Get your Firebase config:
   - Go to Project Settings > General
   - Scroll down to "Your apps" and click the web icon
   - Copy the Firebase configuration object
4. Get Firebase Admin SDK credentials:
   - Go to Project Settings > Service Accounts
   - Click "Generate new private key"
   - Save the JSON file securely

## Step 2: Supabase Setup

1. Create a new Supabase project
2. Get your project URL and anon key:
   - Go to Project Settings > API
   - Copy the "Project URL" and "anon public" key
3. Get your service role key:
   - In the same API settings page
   - Copy the "service_role" key (keep this secret!)
4. Set up the database:
   - Go to SQL Editor
   - Copy and paste the contents of `docs/database_schema.sql`
   - Run the SQL script
5. Set up Storage:
   - Go to Storage
   - Create a new bucket named "project-files"
   - Set it to public if you want public file access

## Step 3: Google Gemini API Setup

1. Go to https://ai.google.dev/
2. Get an API key
3. Save it for the backend configuration

## Step 4: Frontend Setup

1. Navigate to the frontend directory:
```bash
cd x-repo/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Fill in your Firebase and Supabase credentials in `.env`

5. Start the development server:
```bash
npm run dev
```

The frontend will be available at http://localhost:3000

## Step 5: Backend Setup

1. Navigate to the backend directory:
```bash
cd x-repo/backend
```

2. Create a virtual environment:
```bash
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create `.env` file:
```bash
# On Windows PowerShell:
Copy-Item .env.example .env
# On macOS/Linux:
cp .env.example .env
```

5. Fill in your credentials in `.env`:
   - `FIREBASE_CREDENTIALS_PATH`: Path to your Firebase service account JSON file
   - OR `FIREBASE_CREDENTIALS_JSON`: The JSON content as a string
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_SERVICE_KEY`: Your Supabase service role key
   - `GEMINI_API_KEY`: Your Google Gemini API key

6. Start the backend server:
```bash
uvicorn main:app --reload
```

The backend will be available at http://localhost:8000
API documentation at http://localhost:8000/docs

## Step 6: Verify Setup

1. Open http://localhost:3000 in your browser
2. Try to register a new account
3. Check that the backend receives the request (check terminal)
4. Verify the user was created in Supabase (check the users table)

## Troubleshooting

### Firebase Authentication Issues
- Make sure all Firebase environment variables are set correctly
- Verify that Email/Password authentication is enabled in Firebase Console
- Check browser console for Firebase errors

### Supabase Connection Issues
- Verify your Supabase URL and keys are correct
- Check that the database schema was created successfully
- Ensure RLS policies allow your operations

### Backend Import Errors
- Make sure you're in the virtual environment
- Verify all dependencies are installed: `pip list`
- Check that you're running from the backend directory

### Qiskit Installation Issues
- Qiskit requires certain system dependencies on Linux
- On Windows, make sure you have Visual C++ Build Tools if needed
- Try: `pip install --upgrade qiskit qiskit-aer`

## Next Steps

Once setup is complete, you can:
1. Explore the API documentation at http://localhost:8000/docs
2. Start building features
3. Check the PRD for feature requirements
4. Contribute to the project!

## Environment Variables Reference

### Frontend (.env)
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_BASE_URL`

### Backend (.env)
- `FIREBASE_CREDENTIALS_PATH` or `FIREBASE_CREDENTIALS_JSON`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `GEMINI_API_KEY`
- `ALLOWED_ORIGINS`

