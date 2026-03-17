# Backend API - Code Guide

This is a FastAPI application that provides REST endpoints for health/mood tracking with AI analysis.

## File Structure Explained

### `main.py` - FastAPI Application & Routes
**Purpose:** Defines all REST API endpoints

**Key Concepts:**
- `@app.post()` marks functions that handle POST requests
- `@app.get()` marks functions that handle GET requests
- Routes automatically create the API documentation at `/docs`
- `Depends(get_db)` injects the database session into each route

**Routes in this file:**
- `POST /login` - Create or get user
- `POST /entries` - Create new entry
- `GET /entries` - List entries for user
- `GET /stats/summary` - Return statistics
- `POST /analyze` - Run AI analysis
- `GET /analyses` - List past analyses

**How to add a new route:**
```python
@app.post("/example")
async def my_route(request_data: MySchema, db: Session = Depends(get_db)):
    # Your code here
    return response_data
```

### `models.py` - Database Models
**Purpose:** Defines tables using SQLAlchemy ORM

**Tables:**
- `User` - Username and user metadata
- `DailyEntry` - Individual mood/health entries
- `AnalysisSummary` - Saved AI analysis results

**How it works:**
- Classes map to database tables
- `Column()` defines table columns
- `ForeignKey()` creates relationships
- Indexes improve query performance

**To add a new field to DailyEntry:**
```python
class DailyEntry(Base):
    __tablename__ = "daily_entries"
    # ... existing fields ...
    new_field = Column(String, nullable=True)  # New column
```

Then create a database migration (see Alembic below).

### `schemas.py` - Request/Response Validation
**Purpose:** Define data shapes using Pydantic

**Key Points:**
- Schemas validate incoming data
- Auto-transforms responses to JSON
- `from_attributes = True` allows ORM model conversion
- `Optional[]` means field can be None

**Example:**
```python
class DailyEntryCreate(BaseModel):
    date: date              # Required
    mood: int               # Required
    symptoms_text: Optional[str] = None  # Optional
```

**To add validation:**
```python
from pydantic import field_validator

class DailyEntryCreate(BaseModel):
    mood: int
    
    @field_validator('mood')
    @classmethod
    def validate_mood(cls, v):
        if v < 1 or v > 5:
            raise ValueError('Mood must be 1-5')
        return v
```

### `services.py` - Business Logic
**Purpose:** Contains reusable functions for CRUD operations and AI analysis

**Key Functions:**
- `get_or_create_user()` - Find user or create new
- `create_daily_entry()` - Save entry to database
- `get_user_entries()` - Fetch user's entries
- `compute_stats()` - Calculate mood statistics
- `analyze_logs_with_llm()` - Main AI analysis function

**AI Analysis Flow:**
1. If `GEMINI_API_KEY` is set → Call `_analyze_with_gemini()`
2. If not set or fails → Call `_mock_analyze()` (fallback)

**How to modify analysis:**

**Mock Analysis** (no API key):
Edit `_mock_analyze()` to customize rule-based logic:
```python
def _mock_analyze(entries, avg_mood, top_symptoms, best_day, worst_day):
    # Add your own logic here
    patterns = []
    if avg_mood >= 4:
        patterns.append({"title": "Happy", "description": "You're doing great!"})
    return {"summary_text": "...", "patterns": patterns}
```

**Real AI Analysis** (with Gemini):
Edit `_analyze_with_gemini()` to customize the prompt:
```python
def _analyze_with_gemini(...):
    prompt = f"""
    Analyze these health entries:
    {entry_summaries}
    
    Provide insights about mood patterns and symptoms.
    
    Return JSON with:
    - summary_text: 1-2 paragraphs
    - patterns: List of 3-5 patterns found
    """
    # Rest of function...
```

### `db.py` - Database Connection
**Purpose:** Sets up SQLAlchemy engine and session

**What it does:**
- Creates database connection from `DATABASE_URL`
- `SessionLocal` class creates new database sessions
- `get_db()` is used in routes to inject database session

**Don't modify unless:**
- You need a different database (MySQL, SQLite, etc.)
- You need connection pooling changes

### `config.py` - Settings
**Purpose:** Loads configuration from environment variables

**Variables:**
- `DATABASE_URL` - PostgreSQL connection string
- `GEMINI_API_KEY` - Google Gemini API key (optional)
- `GEMINI_MODEL` - Which Gemini model to use
- `FRONTEND_URL` - Where React app runs (for CORS)

**To add new settings:**
```python
class Settings(BaseSettings):
    DATABASE_URL: str = os.getenv("DATABASE_URL", "...")
    NEW_SETTING: str = os.getenv("NEW_SETTING", "default_value")
```

## How the API Works

### Request Flow
```
Browser Request
    ↓
FastAPI Route Handler (main.py)
    ↓
Validate Request (schemas.py)
    ↓
Call Service Function (services.py)
    ↓
Database Query (models.py via SQLAlchemy)
    ↓
Return Response (schemas.py)
    ↓
JSON Response to Browser
```

### Example: Creating an Entry

**Frontend makes request:**
```javascript
POST /entries?user_id=1
{
  "date": "2024-01-15",
  "mood": 4,
  "symptoms_text": "headache"
}
```

**backend/main.py route:**
```python
@app.post("/entries", response_model=DailyEntryResponse)
async def create_entry(
    entry_data: DailyEntryCreate,  # Validates incoming data
    user_id: int,                  # From query parameter
    db: Session = Depends(get_db)  # Database session injected
):
    # Service layer handles business logic
    entry = create_daily_entry(
        db,
        user_id=user_id,
        date=entry_data.date,
        mood=entry_data.mood,
        symptoms_text=entry_data.symptoms_text,
    )
    return entry  # Auto-converts to JSON
```

**backend/services.py:**
```python
def create_daily_entry(db, user_id, date, mood, ...):
    # Create model instance
    entry = DailyEntry(
        user_id=user_id,
        date=date,
        mood=mood,
        ...
    )
    # Save to database
    db.add(entry)
    db.commit()
    db.refresh(entry)  # Get auto-generated fields
    return entry
```

## Database Migrations

The app uses `Base.metadata.create_all(engine)` for initial setup (in main.py).

**For more control, use Alembic:**

```bash
# Initialize Alembic
alembic init alembic

# Create migration after model changes
alembic revision --autogenerate -m "Add new field"

# Apply migration
alembic upgrade head
```

## Debugging Tips

### See SQL Queries
```python
# In config.py
engine = create_engine(DATABASE_URL, echo=True)  # Show SQL queries
```

### Test an endpoint
```bash
curl -X POST http://localhost:8000/login \
  -H "Content-Type: application/json" \
  -d '{"username": "test"}'
```

### Check API docs
Open http://localhost:8000/docs - Interactive Swagger UI

## Common Modifications

### Change mood scale from 1-5 to 1-10:

1. **Update schema** (schemas.py):
```python
class DailyEntryCreate(BaseModel):
    mood: int  # Now accepts 1-10
```

2. **Add validation**:
```python
@field_validator('mood')
def validate_mood(cls, v):
    if v < 1 or v > 10:
        raise ValueError('Mood must be 1-10')
    return v
```

3. **Update frontend** (components/EntryForm.tsx):
```typescript
{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((m) => (
  <button key={m} onClick={() => setMood(m)}>{m}</button>
))}
```

### Add a "weight" field to track weight alongside mood:

1. **Update model** (models.py):
```python
class DailyEntry(Base):
    __tablename__ = "daily_entries"
    # ... existing fields ...
    weight = Column(Float, nullable=True)  # New field
```

2. **Update schema** (schemas.py):
```python
class DailyEntryCreate(BaseModel):
    weight: Optional[float] = None  # Optional weight data
```

3. **Update service** (services.py):
```python
def create_daily_entry(db, user_id, date, mood, weight=None, ...):
    entry = DailyEntry(
        user_id=user_id,
        weight=weight,
        # ... rest
    )
```

4. **Update route** (main.py):
```python
@app.post("/entries")
async def create_entry(entry_data: DailyEntryCreate, ...):
    entry = create_daily_entry(
        db,
        weight=entry_data.weight,  # Include weight
        # ...
    )
```

5. **Run migration** to add column to database

### Add authentication with API keys:

```python
# In services.py
from uuid import uuid4

def create_user(db, username):
    api_key = str(uuid4())
    user = User(username=username, api_key=api_key)
    db.add(user)
    db.commit()
    return user

# In main.py
from fastapi.security import APIKeyHeader

api_key_header = APIKeyHeader(name="X-API-Key")

@app.get("/entries")
async def get_entries(api_key: str = Depends(api_key_header), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.api_key == api_key).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return get_user_entries(db, user.id)
```

## Environment Variables Reference

```env
# DATABASE
DATABASE_URL=postgresql://username:password@host:port/database

# GEMINI AI (optional)
GEMINI_API_KEY=your_key_here          # Get from https://ai.google.dev/
GEMINI_MODEL=gemini-2.5-flash         # Or: gemini-2.5-flash-lite, gemini-1.5-pro

# CORS
FRONTEND_URL=http://localhost:5173    # Where your React app runs
```

## Testing

```bash
# Run tests
pytest

# Run specific test file
pytest tests/test_services.py

# Run with coverage
pytest --cov=.
```

Example test:
```python
# tests/test_services.py
from services import get_or_create_user
from models import User

def test_get_or_create_user_new(db_session):
    user = get_or_create_user(db_session, "newuser")
    assert user.username == "newuser"
    assert user.id is not None

def test_get_or_create_user_existing(db_session):
    user1 = get_or_create_user(db_session, "john")
    user2 = get_or_create_user(db_session, "john")
    assert user1.id == user2.id  # Same user
```

## Performance Tips

### Add indexes for frequently queried fields:
```python
# In models.py
class DailyEntry(Base):
    __tablename__ = "daily_entries"
    # ... fields ...
    
    # Add index for user_id and date searches
    __table_args__ = (
        Index('idx_user_date', 'user_id', 'date'),
    )
```

### Use query limits:
```python
# Bad - loads all entries
entries = db.query(DailyEntry).filter(...).all()

# Good - limit results
entries = db.query(DailyEntry).filter(...).limit(100).all()
```

### Use pagination for large datasets:
```python
def get_paginated_entries(db, user_id, page: int = 1, limit: int = 20):
    skip = (page - 1) * limit
    return db.query(DailyEntry)\
        .filter(DailyEntry.user_id == user_id)\
        .offset(skip)\
        .limit(limit)\
        .all()
```

## Summary

- **main.py** = Routes/endpoints
- **models.py** = Database tables
- **schemas.py** = Data validation
- **services.py** = Business logic
- **db.py** = Database setup
- **config.py** = Settings from environment

The flow is: Request → Route → Validation → Service → Database → Model → Schema → JSON Response

Good luck! Ask questions if anything is unclear.
