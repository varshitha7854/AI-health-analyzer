# Health & Mood Data Notebook - Complete Setup Guide

This guide walks you through setting up and running the complete application (backend + frontend).

## Project Structure

```
AI Health analyzer/
├── backend/
│   ├── config.py           # Settings and configuration
│   ├── db.py              # Database connection setup
│   ├── main.py            # FastAPI app and routes
│   ├── models.py          # SQLAlchemy database models
│   ├── schemas.py         # Pydantic request/response schemas
│   ├── services.py        # Business logic (CRUD, AI analysis)
│   ├── requirements.txt    # Python dependencies
│   ├── .env.example       # Example environment variables
│   └── .env               # (Create this - actual env vars, don't commit)
└── frontend/
    ├── package.json       # Node dependencies
    ├── vite.config.ts     # Vite configuration
    ├── tsconfig.json      # TypeScript configuration
    ├── index.html         # HTML entry point
    ├── .env.example       # Example environment variables
    ├── .env               # (Create this - actual env vars, don't commit)
    └── src/
        ├── main.tsx       # React entry point
        ├── App.tsx        # Main app component
        ├── api.ts         # API client functions
        ├── pages/
        │   ├── Login.tsx      # Login page
        │   └── Dashboard.tsx  # Main dashboard page
        ├── components/
        │   ├── EntryForm.tsx      # Form to create new entry
        │   ├── EntryList.tsx      # Display recent entries
        │   ├── StatsSection.tsx   # Show statistics
        │   └── AnalysisSection.tsx # AI analysis and history
        └── styles/
            └── index.css  # All CSS styles
```

## Prerequisites

1. **PostgreSQL** - Database server
   - Download from: https://www.postgresql.org/download/
   - Windows: Use installer or WSL
   - Mac: Use Homebrew `brew install postgresql` or download
   - Linux: Use package manager `apt-get install postgresql`

2. **Node.js** (v16 or higher) - JavaScript runtime
   - Download from: https://nodejs.org/

3. **Python** (3.8 or higher)
   - Download from: https://www.python.org/

4. **Text Editor or IDE**
   - VS Code: https://code.visualstudio.com/ (recommended)

## Step 1: Setup PostgreSQL Database

### On Windows (using installer):
1. Run the PostgreSQL installer
2. Remember the password you set for the `postgres` user
3. Note: Default port is 5432 (not 5000)
4. Start PostgreSQL service (it should auto-start)

### Verify PostgreSQL is running:
```bash
# Windows PowerShell
psql -U postgres -c "SELECT version();"

# If prompted for password, enter the password you set during installation
```

### Create the database:
```bash
# Connect to PostgreSQL
psql -U postgres

# In psql prompt:
CREATE DATABASE health_mood_db;
\q
```

Or from command line:
```bash
createdb -U postgres health_mood_db
```

**Note**: If you see "role 'postgres' does not exist", you may need to use a different username or adjust your PostgreSQL setup.

## Step 2: Setup Backend

### 1. Navigate to backend directory
```bash
cd "e:\AI Health analyzer\backend"
```

### 2. Create virtual environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Mac/Linux
python3 -m venv venv
source venv/bin/activate
```

You should see `(venv)` at the start of your terminal line.

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Create .env file
Copy `.env.example` to `.env` and update with your settings:
```bash
# Windows
copy .env.example .env

# Mac/Linux
cp .env.example .env
```

Edit `.env`:
```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/health_mood_db
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
FRONTEND_URL=http://localhost:5173
```

Replace `YOUR_PASSWORD` with the password you set for postgres during installation.

**Important**: Keep `.env` secret! Never commit it to git or share it.

### 5. Run the backend
```bash
uvicorn main:app --reload
```

You should see:
```
✓ Starting in MOCK AI mode (no GEMINI_API_KEY set)
Uvicorn running on http://127.0.0.1:8000
Press CTRL+C to quit
```

**The backend is now running at http://localhost:8000**

## Step 3: Setup Frontend

### 1. Open a NEW terminal window and navigate to frontend
```bash
cd "e:\AI Health analyzer\frontend"
```

### 2. Create .env file
```bash
# Windows
copy .env.example .env

# Mac/Linux
cp .env.example .env
```

Edit `.env` (usually no changes needed):
```
VITE_API_URL=http://localhost:8000
```

### 3. Install dependencies
```bash
npm install
```

### 4. Run the frontend
```bash
npm run dev
```

You should see:
```
VITE v5.0.0  ready in 123 ms

➜  Local:   http://localhost:5173/
```

**The frontend is now running at http://localhost:5173**

## Step 4: Test the Application

1. **Open your browser** and go to: http://localhost:5173

2. **Create an account**:
   - Enter a username (e.g., "john_doe")
   - Click "Log In"
   - A new user account is created automatically

3. **Create an entry**:
   - Select today's date
   - Choose a mood (1-5 stars)
   - Add symptoms (optional): "headache, tired"
   - Add notes (optional): "Had a long day at work"
   - Click "Create Entry"

4. **View statistics**:
   - See total entries and average mood

5. **Analyze entries** (Uses mock AI by default):
   - Click "Analyze" to get AI-powered insights
   - You'll see summary and patterns based on your entries

6. **View past analyses**:
   - Scroll down to see previous analyses

## Adding Gemini AI (Optional)

To enable real AI analysis instead of mock:

1. Get a free API key:
   - Go to https://ai.google.dev/
   - Click "Get API Key"
   - Create new free API key
   - Copy the key

2. Add to backend `.env`:
   ```
   GEMINI_API_KEY=your_actual_key_here
   GEMINI_MODEL=gemini-2.5-flash
   ```

3. Restart the backend:
   - Press CTRL+C in backend terminal
   - Run `uvicorn main:app --reload` again

4. You should now see:
   ```
   ✓ Starting in Gemini AI mode
   ```

5. Test analysis button again - it will now use real Gemini API!

## Troubleshooting

### Backend errors:

**"PostgreSQL: connection refused" or "role 'postgres' does not exist"**
- Verify PostgreSQL is running
- Check DATABASE_URL in .env
- Ensure user/password are correct
- For Windows: Default postgres user exists, but you need the correct password

**"Module not found: google.generativeai"**
- Run: `pip install google-generativeai`

**Port 8000 already in use**
- Use different port: `uvicorn main:app --reload --port 8001`
- Update FRONTEND_URL in backend .env

### Frontend errors:

**"Cannot find module 'react'"**
- Run: `npm install`

**Port 5173 already in use**
- Vite will automatically try port 5174, just use that URL

**CORS errors in browser console**
- Ensure backend is running
- Check FRONTEND_URL in backend .env matches your frontend URL

## API Endpoints Reference

### Users
- `POST /login`
  - Body: `{"username": "john"}`
  - Returns: `{"id": 1, "username": "john"}`

### Entries
- `POST /entries?user_id=1`
  - Body: `{"date": "2024-01-15", "mood": 4, "symptoms_text": "headache", "notes_text": "..."}`
  
- `GET /entries?user_id=1&limit=30`
  - Returns: List of entries

### Stats
- `GET /stats/summary?user_id=1`
  - Returns: `{"total_entries": 5, "average_mood": 3.5, "entries_per_day": [...]}`

### Analysis
- `POST /analyze`
  - Body: `{"user_id": 1, "days": 30}`
  - Returns: `{"summary_text": "...", "patterns": [{"title": "...", "description": "..."}]}`

- `GET /analyses?user_id=1`
  - Returns: List of past analyses

## Testing with curl

### Create a user:
```bash
curl -X POST http://localhost:8000/login \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser"}'
```

### Create an entry:
```bash
curl -X POST "http://localhost:8000/entries?user_id=1" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2024-01-15",
    "mood": 4,
    "symptoms_text": "headache",
    "notes_text": "Good day overall"
  }'
```

### Get entries:
```bash
curl "http://localhost:8000/entries?user_id=1&limit=10"
```

### Get stats:
```bash
curl "http://localhost:8000/stats/summary?user_id=1"
```

### Analyze:
```bash
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{"user_id": 1, "days": 30}'
```

## Stopping the Application

**Backend**: Press `CTRL+C` in the backend terminal
**Frontend**: Press `CTRL+C` in the frontend terminal

## Building for Production

### Backend:
```bash
# No build needed, just deploy the Python files
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Frontend:
```bash
npm run build

# Output is in dist/ folder
# Deploy to Netlify, Vercel, or traditional web server
```

## Database Backups

### Export database:
```bash
pg_dump -U postgres health_mood_db > backup.sql
```

### Restore database:
```bash
psql -U postgres health_mood_db < backup.sql
```

## Common Modifications

### Change Gemini model:
Edit backend `.env`:
```
GEMINI_MODEL=gemini-2.5-flash-lite  # Faster, cheaper
GEMINI_MODEL=gemini-1.5-pro          # Most capable
```

### Change database:
Edit backend `.env`:
```
DATABASE_URL=postgresql://user:password@host:port/database_name
```

### Change frontend port:
Edit `frontend/vite.config.ts`:
```typescript
server: {
  port: 3000,  // Changed from 5173
}
```

## Questions or Issues?

1. Check the troubleshooting section above
2. Look at terminal error messages carefully
3. Verify all prerequisites are installed
4. Ensure both backend and frontend are running before testing

## Next Steps

- Create more entries to build a dataset
- Analyze patterns with AI
- Check out the GitHub repo for model changes
- Deploy to production when ready

Enjoy your Health & Mood Notebook!
