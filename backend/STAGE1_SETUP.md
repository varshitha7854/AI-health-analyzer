# Stage 1: Backend Skeleton Setup

## What You Have Now

Your backend is a complete **FastAPI + SQLAlchemy + PostgreSQL** skeleton with:

✅ Database models (User, DailyEntry, AnalysisSummary)  
✅ Pydantic schemas for validation  
✅ Business logic services  
✅ 6 API endpoints (listed below)  
✅ Mock AI analysis (ready for Gemini in Stage 2)  
✅ CORS setup for your frontend  

## Step 1: Create PostgreSQL Database

**On your machine, create the database:**

```bash
psql -U postgres
postgres=# CREATE DATABASE health_mood_db;
postgres=# \q
```

Or if you prefer a GUI, use pgAdmin.

## Step 2: Set Up .env File

Create `backend/.env`:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/health_mood_db
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
FRONTEND_URL=http://localhost:5173
```

**Leave GEMINI_API_KEY empty for now** — the app will use mock analysis until you add your key in Stage 2.

## Step 3: Install Python Dependencies

In `backend/`:

```bash
pip install -r requirements.txt
```

## Step 4: Run the Backend

Still in `backend/`:

```bash
uvicorn main:app --reload
```

You'll see:
```
============================================================
⚠ Starting in MOCK AI mode (no GEMINI_API_KEY set)
============================================================
```

The API will be at: **http://127.0.0.1:8000**

## Step 5: Test the API

Use Postman, curl, or VS Code REST Client. Here's a test sequence:

### 1. Health check
```
GET http://127.0.0.1:8000/health
```

Response:
```json
{"status": "ok"}
```

### 2. Create/login a user
```
POST http://127.0.0.1:8000/login
Content-Type: application/json

{"username": "alice"}
```

Response:
```json
{"id": 1, "username": "alice"}
```

*Note: Running this again with the same username returns the existing user.*

### 3. Create a daily entry
```
POST http://127.0.0.1:8000/entries?user_id=1
Content-Type: application/json

{
  "date": "2026-03-15",
  "mood": 4,
  "symptoms_text": "headache, tired",
  "notes_text": "Had a long day at work"
}
```

Response:
```json
{
  "id": 1,
  "user_id": 1,
  "date": "2026-03-15",
  "mood": 4,
  "symptoms_text": "headache, tired",
  "notes_text": "Had a long day at work",
  "created_at": "2026-03-16T..."
}
```

### 4. Add a few more entries (different dates/moods)

Try posting entries with different dates and mood values.

### 5. Get entries for a user
```
GET http://127.0.0.1:8000/entries?user_id=1&limit=10
```

Response: array of entries, newest first.

### 6. Get stats summary
```
GET http://127.0.0.1:8000/stats/summary?user_id=1
```

Response:
```json
{
  "total_entries": 5,
  "average_mood": 3.8,
  "entries_per_day": [
    {"date": "2026-03-15", "count": 2},
    {"date": "2026-03-16", "count": 3}
  ]
}
```

### 7. Analyze (mock mode)
```
POST http://127.0.0.1:8000/analyze
Content-Type: application/json

{
  "user_id": 1,
  "days": 30
}
```

Response:
```json
{
  "summary_text": "Over the past 5 entries, your mood averaged 3.8 out of 5...",
  "patterns": [
    {
      "title": "Common Symptoms",
      "description": "Frequent symptoms: headache, tired."
    }
  ]
}
```

### 8. Get past analyses
```
GET http://127.0.0.1:8000/analyses?user_id=1
```

Response: array of past analyses with timestamps.

## API Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/health` | Health check |
| POST | `/login` | Create or get user by username |
| POST | `/entries` | Create a daily entry |
| GET | `/entries` | List user's entries |
| GET | `/stats/summary` | Get mood stats |
| POST | `/analyze` | Analyze entries (mock mode) |
| GET | `/analyses` | List past analyses |

## What to Test

- [x] All endpoints return data in correct format
- [x] Mood validation (1-5 only)
- [x] User creation works
- [x] Multiple entries can be added
- [x] Stats compute correctly
- [x] Mock analysis runs without errors

## Ready for Stage 2?

When you're satisfied that all endpoints work, reply with **"OK"** and I'll:

1. Update `services.py` to call the Gemini API
2. Show you where to paste your GEMINI_API_KEY
3. Explain how the Gemini integration works

---

**Next up:** Stage 2 (Gemini Integration) → Stage 3 (React Frontend)
