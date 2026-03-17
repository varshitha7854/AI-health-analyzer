# 🎯 Quick Reference Guide

A one-page reference for the Health & Mood Data Notebook project.

## Project Overview

**What:** A full-stack web app for tracking health/mood with AI-powered insights.  
**Who:** Built for Jetty AI internship candidates (data-heavy, full-stack role).  
**Tech:** Python (FastAPI) + React (TypeScript) + PostgreSQL + Google Gemini.  
**Status:** Complete and ready to run! ✅

---

## 📁 Complete File Structure

```
e:\AI Health analyzer\
│
├── 📄 README.md                  Start here - project overview
├── 📄 SETUP.md                   Step-by-step setup instructions
├── 📄 API_TESTING.md             How to test API endpoints
├── 📄 BUILD_SUMMARY.md           What was built (this project)
├── 📄 QUICK_REFERENCE.md         You are here!
├── 📄 .gitignore                 Git ignore file
│
├── 📁 backend/                   Python FastAPI backend
│   ├── main.py                   Routes & API endpoints (7 endpoints)
│   ├── models.py                 Database models (3 tables)
│   ├── schemas.py                Pydantic validation schemas
│   ├── services.py               Business logic & AI analysis
│   ├── db.py                     Database connection setup
│   ├── config.py                 Settings from environment
│   ├── requirements.txt           Python dependencies (13 packages)
│   ├── .env.example              Example environment variables
│   ├── .env                      ACTUAL env vars (create this - secret!)
│   ├── .gitignore                Git ignore for backend
│   ├── README.md                 Backend code guide
│   └── __pycache__/              Python cache (auto-generated)
│
├── 📁 frontend/                  React + Vite + TypeScript frontend
│   ├── index.html                HTML entry point
│   ├── package.json              Node dependencies
│   ├── vite.config.ts            Vite build config
│   ├── tsconfig.json             TypeScript config
│   ├── tsconfig.node.json        TypeScript config for Vite
│   ├── .env.example              Example environment variables
│   ├── .env                      ACTUAL env vars (create this)
│   ├── .gitignore                Git ignore for frontend
│   ├── README.md                 Frontend code guide
│   │
│   └── 📁 src/
│       ├── main.tsx              React entry point
│       ├── App.tsx               Main app component (routing)
│       ├── api.ts                API client (all backend calls)
│       │
│       ├── 📁 pages/
│       │   ├── Login.tsx         Login/signup page
│       │   └── Dashboard.tsx     Main app dashboard
│       │
│       ├── 📁 components/
│       │   ├── EntryForm.tsx     Create new entry form
│       │   ├── EntryList.tsx     Display recent entries
│       │   ├── StatsSection.tsx  Show statistics & chart
│       │   └── AnalysisSection.tsx  AI analysis & history
│       │
│       └── 📁 styles/
│           └── index.css         All CSS styles (~700 lines)
```

---

## 🚀 Run It (3 Commands)

### Terminal 1: Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env              # Edit with your PostgreSQL password
uvicorn main:app --reload
```
👉 Backend at http://localhost:8000

### Terminal 2: Frontend
```bash
cd frontend
npm install
cp .env.example .env              # Usually no changes needed
npm run dev
```
👉 Frontend at http://localhost:5173

### Terminal 3: Test It
```bash
# Create user
curl -X POST http://localhost:8000/login \
  -H "Content-Type: application/json" \
  -d '{"username": "test_user"}'

# Or open Swagger UI: http://localhost:8000/docs
```

---

## 🗄️ Database Setup (One-Time)

```bash
# Create database
createdb -U postgres health_mood_db

# Update backend/.env with your PostgreSQL password:
# DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/health_mood_db
```

---

## 📊 What Each File Does

### Backend Core Files

| File | Purpose | Lines | Key Concepts |
|------|---------|-------|--------------|
| `main.py` | REST API routes | 150 | @app.post/get, Depends(get_db) |
| `models.py` | Database tables | 40 | SQLAlchemy ORM, Column(), ForeignKey() |
| `schemas.py` | Data validation | 80 | Pydantic BaseModel, from_attributes |
| `services.py` | Business logic | 250 | CRUD, stats, AI analysis, Gemini API |
| `db.py` | DB connection | 15 | SQLAlchemy engine, SessionLocal |
| `config.py` | Settings | 20 | Environment variables, BaseSettings |

### Frontend Core Files

| File | Purpose | Lines | Key Concepts |
|------|---------|-------|--------------|
| `App.tsx` | App routing | 30 | useState, useEffect, localStorage |
| `api.ts` | API calls | 100 | fetch(), type definitions |
| `pages/Login.tsx` | Login form | 50 | Form submit, API call, state |
| `pages/Dashboard.tsx` | Layout | 40 | Child components, props, refresh |
| `components/*.tsx` | UI components | 300 | useState, useEffect, API calls |
| `styles/index.css` | All styling | 700 | Grid, Flexbox, responsive |

---

## 🔗 API Endpoints

| Method | Endpoint | Purpose | Request | Response |
|--------|----------|---------|---------|----------|
| POST | `/login` | Create/get user | `{username}` | `{id, username}` |
| POST | `/entries?user_id=X` | Create entry | Entry data | Entry with ID |
| GET | `/entries?user_id=X` | List entries | - | Entry array |
| GET | `/stats/summary?user_id=X` | Get stats | - | `{total, avg_mood, per_day}` |
| POST | `/analyze` | Run AI analysis | `{user_id, days}` | `{summary_text, patterns}` |
| GET | `/analyses?user_id=X` | Get past analyses | - | Analysis array |
| GET | `/health` | Health check | - | `{status: ok}` |

---

## 📦 Dependencies

### Backend (Python)
```
fastapi, uvicorn       # Web framework
sqlalchemy, psycopg2   # Database
pydantic               # Validation
google-generativeai    # Gemini AI
python-dotenv          # Environment variables
```

### Frontend (Node)
```
react, react-dom       # UI library
vite                   # Build tool
typescript             # Language
```

---

## 🤖 AI Integration

### Without API Key (Default - Works!)
- Mock analysis using Python
- Generates summary from entry statistics
- No API calls

### With API Key (Optional - Better!)
1. Get key: https://ai.google.dev/
2. Add to backend/.env: `GEMINI_API_KEY=your_key_here`
3. Restart backend
4. Analysis now uses real Gemini API

---

## 📱 User Features

### What Users Can Do
- ✅ Create account with just a username
- ✅ Log daily mood (1-5 with emoji)
- ✅ Track symptoms (text list)
- ✅ Add notes
- ✅ View recent entries
- ✅ See statistics
- ✅ Analyze trends with AI
- ✅ View analysis history
- ✅ Logout

### What Users See
- Login page → enters username → auto-creates account → Dashboard
- Dashboard with 4 sections:
  1. Entry form (create new)
  2. Statistics (total, average, chart)
  3. Entry list (recent entries)
  4. Analysis (AI insights + history)

---

## 🔧 Configuration

### Backend (.env)
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/health_mood_db
GEMINI_API_KEY=                          # Leave empty for mock
GEMINI_MODEL=gemini-2.5-flash           # Or other models
FRONTEND_URL=http://localhost:5173       # CORS
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000      # Backend URL
```

---

## 🎯 Key Code Flows

### Creating an Entry (Request → Database)
```
Frontend (EntryForm) 
  → POST /entries?user_id=1 
  → main.py route handler
  → validate with schema
  → create_daily_entry() service
  → DailyEntry model.add to DB
  → return DailyEntryResponse
  → Frontend updates list
```

### Getting Analysis
```
Frontend (AnalysisSection)
  → POST /analyze {user_id, days}
  → services.analyze_logs_with_llm()
  → if API key: call Gemini API
  → else: mock analysis
  → save AnalysisSummary to DB
  → return {summary_text, patterns}
  → Frontend shows results
```

---

## 💡 Code Patterns to Know

### React Hooks
```typescript
useState(initial)         // Remember state
useEffect(() => {}, [])  // Run side effects
```

### API Calls
```typescript
async function loadData() {
  try {
    const data = await fetch('/api/...')
    setData(data)
  } catch (err) {
    setError(err)
  }
}
```

### SQLAlchemy
```python
db.query(Model).filter(...).all()    # Read
db.add(obj); db.commit()             # Create
```

### Pydantic
```python
class Schema(BaseModel):
    field: type = default
    @field_validator('field')
    def validate(cls, v): return v
```

---

## 🧪 Testing Endpoints

### Swagger UI (Easiest!)
Open http://localhost:8000/docs - Interactive API docs

### curl (Command Line)
```bash
# Create user
curl -X POST http://localhost:8000/login \
  -H "Content-Type: application/json" \
  -d '{"username": "alice"}'

# Create entry
curl -X POST "http://localhost:8000/entries?user_id=1" \
  -H "Content-Type: application/json" \
  -d '{"date": "2024-01-15", "mood": 4}'

# See all endpoints in API_TESTING.md
```

---

## 📚 Documentation Map

| Document | Purpose |
|----------|---------|
| README.md | Project overview & features |
| SETUP.md | Step-by-step installation |
| API_TESTING.md | How to test every endpoint |
| backend/README.md | Backend code walkthrough |
| frontend/README.md | Frontend code walkthrough |
| BUILD_SUMMARY.md | What was built & learning path |
| QUICK_REFERENCE.md | You are here! |

---

## 🎓 Learning Path

### Day 1: Setup
- [ ] Read README.md
- [ ] Follow SETUP.md
- [ ] Get backend & frontend running

### Day 2: Understand Flow
- [ ] Read backend/README.md
- [ ] Trace a request: form → API → database
- [ ] Read frontend/README.md
- [ ] Understand component props/state

### Day 3: Make Changes
- [ ] Add a new mood category
- [ ] Change a style
- [ ] Modify AI analysis logic
- [ ] Test using API_TESTING.md

### Day 4: Deploy
- [ ] Build frontend: npm run build
- [ ] Deploy backend (Heroku/Railway)
- [ ] Deploy frontend (Netlify/Vercel)

---

## ⚡ Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| "PostgreSQL connection refused" | Start PostgreSQL, check DATABASE_URL |
| "Module not found" | Run pip install / npm install |
| "Port 8000 in use" | Kill process or use different port |
| "No entries for analysis" | Create 5+ entries first |
| "CORS error" | Verify backend running & FRONTEND_URL |
| "AI not working" | Add GEMINI_API_KEY to .env (optional) |

---

## 📊 Project Stats

- **Backend:** ~600 lines Python
- **Frontend:** ~1200 lines TypeScript/React
- **Styles:** ~700 lines CSS
- **Database:** 3 tables, proper indexing
- **Documentation:** 6 comprehensive guides
- **API Endpoints:** 7 fully functional
- **Features:** 15+ working features

---

## 🚀 What's Production-Ready

✅ Error handling  
✅ Input validation  
✅ CORS configuration  
✅ Environment variables  
✅ Database migrations ready  
✅ API documentation  
✅ Code organization  
✅ Comments & docstrings  

---

## 🎯 Interview Talking Points

"I built a full-stack app demonstrating:
- **Data modeling** with 3 normalized tables
- **REST API** design with 7 endpoints
- **Database ORM** using SQLAlchemy
- **Frontend** with React & TypeScript
- **AI integration** with error handling
- **Authentication** basics
- **Error handling** and validation
- **Comprehensive documentation**"

---

## 📞 Need Help?

1. **Setup issue?** → Read SETUP.md
2. **API question?** → Check API_TESTING.md
3. **Code unclear?** → Read backend/README.md or frontend/README.md
4. **Want to learn more?** → Read BUILD_SUMMARY.md

---

## ✨ Remember

- **Don't modify .env** - it's your secret config
- **Don't commit .env** - add to .gitignore ✓
- **Both servers must run** - backend AND frontend
- **Frontend needs backend** - they talk via API
- **Data persists** - PostgreSQL keeps it safe
- **AI is optional** - app works without Gemini key

---

**You have everything you need! Run the servers and have fun! 🎉**

```bash
# Terminal 1:
cd backend && uvicorn main:app --reload

# Terminal 2:
cd frontend && npm run dev

# Browser:
http://localhost:5173
```
