# X-Repo - Quantum Collaborative Platform

X-Repo is an open-source quantum collaborative platform designed to democratize quantum computing education and collaboration. The platform enables quantum computing enthusiasts, researchers, and students to share projects, simulate quantum circuits with AI guidance, and build knowledge-sharing communities.

## Features

- **Quantum Project Repository**: Upload, share, and discover quantum computing projects
- **AI-Integrated Circuit Playground**: Design, simulate, and optimize quantum circuits with AI assistance
- **Knowledge-Sharing Communities**: Join communities, share insights, and engage in real-time discussions
- **User Profiles**: Showcase your quantum computing journey

## Tech Stack

### Frontend
- Vite + React 18
- TypeScript
- Tailwind CSS
- React Router
- Firebase Authentication
- Supabase (Database & Storage)

### Backend
- FastAPI (Python)
- Qiskit (Quantum Computing)
- Google Gemini API (AI Assistance)
- Firebase Admin SDK
- Supabase Python Client

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.10+
- Firebase project
- Supabase project
- Google Gemini API key

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory:
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=http://localhost:8000/api
```

4. Start the development server:
```bash
npm run dev
```

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file in the backend directory:
```env
FIREBASE_CREDENTIALS_PATH=path/to/serviceAccountKey.json
# OR
FIREBASE_CREDENTIALS_JSON={"type":"service_account",...}
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
GEMINI_API_KEY=your_gemini_api_key
ALLOWED_ORIGINS=http://localhost:3000
```

5. Set up the database:
   - Go to your Supabase project
   - Open the SQL Editor
   - Run the SQL from `docs/database_schema.sql`

6. Start the backend server:
```bash
uvicorn main:app --reload
```

## Project Structure

```
x-repo/
├── frontend/          # React frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API and service integrations
│   │   ├── contexts/      # React contexts
│   │   ├── types/         # TypeScript types
│   │   └── utils/         # Utility functions
│   └── package.json
├── backend/           # FastAPI backend application
│   ├── routers/       # API route handlers
│   ├── services/      # Business logic services
│   ├── middleware/    # Middleware (auth, etc.)
│   ├── models/        # Data models
│   └── main.py        # FastAPI app entry point
├── docs/              # Documentation
│   └── database_schema.sql
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create user profile
- `GET /api/auth/me` - Get current user
- `POST /api/auth/verify-token` - Verify Firebase token

### Projects
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `GET /api/projects/{id}` - Get project details
- `PATCH /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project
- `POST /api/projects/{id}/star` - Star/unstar project
- `POST /api/projects/{id}/files` - Upload file

### Circuits
- `POST /api/circuits/simulate` - Simulate circuit
- `POST /api/circuits/export-qasm` - Export to QASM
- `POST /api/circuits/export-qiskit` - Export to Qiskit code
- `POST /api/circuits/import-qasm` - Import from QASM
- `POST /api/circuits/save` - Save circuit
- `POST /api/circuits/ai-assist` - Get AI assistance

### Communities
- `GET /api/communities` - List communities
- `POST /api/communities` - Create community
- `GET /api/communities/{name}` - Get community
- `POST /api/communities/{name}/join` - Join community
- `POST /api/communities/{name}/leave` - Leave community

### Posts & Comments
- `GET /api/posts` - List posts
- `POST /api/posts` - Create post
- `POST /api/posts/{id}/vote` - Vote on post
- `POST /api/comments` - Create comment
- `POST /api/comments/{id}/vote` - Vote on comment

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.See [Contributing.md](CONTRIBUTING.md) file for more details.

## License

MIT License - see [LICENSE](LICENSE) file for details

## Support

For questions or support, please open an issue on GitHub or contact us through the platform.

