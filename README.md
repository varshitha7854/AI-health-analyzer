# Health & Mood Data Notebook

A modern, single-page web application for tracking health and mood with AI-powered analysis using Google Gemini.

## Features

✨ **Intelligent Data Tracking**
- Log daily mood (1-5), symptoms, and notes
- Beautiful, intuitive interface with emoji mood selectors
- Date-based entry organization

📊 **Real-time Analytics**
- View total entries and average mood
- Visual bar chart of entries per day
- Statistics update automatically

🤖 **AI-Powered Insights** (with Gemini API)
- Automatic pattern detection in mood and symptoms
- Historical analysis summaries
- Fallback mock analysis when API key not configured

👤 **User-Friendly Authentication**
- Simple username-based login
- Auto-account creation for first-time users
- No passwords or complex auth needed

## Tech Stack

**Backend:**
- Python 3.8+
- FastAPI for REST API
- SQLAlchemy ORM with PostgreSQL
- Google Generative AI (Gemini API)
- Pydantic for data validation

**Frontend:**
- React 18 with TypeScript
- Vite for fast development
- Modern CSS with responsive design
- No external UI frameworks (vanilla HTML/CSS)

**Database:**
- PostgreSQL for reliable data storage

## Quick Start

### Prerequisites
- PostgreSQL installed and running
- Python 3.8+
- Node.js 16+

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env      # Edit with your PostgreSQL credentials
uvicorn main:app --reload
```

Backend runs at: **http://localhost:8000**

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs at: **http://localhost:5173**

## Database Setup

```bash
# Create PostgreSQL database
createdb -U postgres health_mood_db
```

Update `backend/.env` with correct PostgreSQL connection URL.

## Configuration

### Backend (.env)
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/health_mood_db
GEMINI_API_KEY=                  # Optional - leave empty for mock AI
GEMINI_MODEL=gemini-2.5-flash   # Or gemini-2.5-flash-lite, gemini-1.5-pro
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
```

## Detailed Setup Guide

See [SETUP.md](./SETUP.md) for comprehensive setup instructions with troubleshooting.

## API Endpoints

### Authentication
- `POST /login` - Login/create user by username

### Entries
- `POST /entries` - Create new daily entry
- `GET /entries` - Get user's entries

### Statistics
- `GET /stats/summary` - Get mood statistics

### Analysis
- `POST /analyze` - Generate AI analysis
- `GET /analyses` - Get past analyses

Full API documentation available at `/docs` when backend is running.

## Project Structure

```
├── backend/
│   ├── main.py              # FastAPI routes
│   ├── models.py            # SQLAlchemy models
│   ├── services.py          # Business logic & AI integration
│   ├── schemas.py           # Pydantic schemas
│   ├── db.py                # Database setup
│   ├── config.py            # Configuration
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/           # Login, Dashboard pages
│   │   ├── components/      # Reusable components
│   │   ├── styles/          # CSS styles
│   │   ├── api.ts           # API client
│   │   └── App.tsx          # Main app
│   ├── package.json
│   └── vite.config.ts
└── SETUP.md                 # Detailed setup guide
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Daily Entries Table
```sql
CREATE TABLE daily_entries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    date DATE NOT NULL,
    mood INTEGER NOT NULL (1-5),
    symptoms_text TEXT,
    notes_text TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Analysis Summaries Table
```sql
CREATE TABLE analysis_summaries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    generated_at TIMESTAMP DEFAULT NOW(),
    summary_text TEXT NOT NULL,
    patterns_json JSON NOT NULL
);
```

## Usage Example

1. **Open** frontend: http://localhost:5173
2. **Create account** with just a username
3. **Log daily entries**:
   - Select date and mood (1-5)
   - Add symptoms: "headache, fatigue"
   - Add notes: "Didn't sleep well"
4. **View stats** in sidebar
5. **Analyze** last 30 days - see AI-generated insights
6. **View history** of past analyses

## Enabling Gemini AI

1. Get free API key: https://ai.google.dev/
2. Add to `backend/.env`: `GEMINI_API_KEY=your_key_here`
3. Restart backend
4. Analysis will now use real Gemini AI instead of mock

## Troubleshooting

**PostgreSQL connection errors:**
- Ensure PostgreSQL is running
- Verify DATABASE_URL in .env
- Check username/password match

**CORS errors:**
- Verify backend is running
- Check FRONTEND_URL in backend .env

**Missing modules:**
- Backend: `pip install -r requirements.txt`
- Frontend: `npm install`

See [SETUP.md](./SETUP.md) for more detailed troubleshooting.

## Development

### Run tests
```bash
cd backend
pytest
```

### Build frontend production
```bash
cd frontend
npm run build
# Output in dist/
```

## Deployment

### Backend
Deploy Python app to:
- Heroku, Railway, Render, or any Python hosting
- Update FRONTEND_URL environment variable

### Frontend
Build and deploy to:
- Netlify, Vercel, AWS S3, or traditional web server
- Update VITE_API_URL in build environment

## License

Educational project for Jetty AI internship program.

## Support

For issues or questions, refer to SETUP.md troubleshooting section.

---

**Built for:** Jetty AI Internship - Data-Heavy Role  
**Created:** 2024  
**Stack:** Python + FastAPI + React + PostgreSQL + Gemini AI
