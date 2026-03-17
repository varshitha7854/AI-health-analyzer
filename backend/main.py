from fastapi import FastAPI, Depends, HTTPException, Query, Path
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from db import get_db, Base, engine
from schemas import UserCreate, User, DailyEntryCreate, DailyEntry, StatsResponse, InsightsResponse
from services import (
    create_user,
    get_user,
    create_entry,
    get_entries,
    get_stats,
    get_user_entries_count,
    compute_insights,
)

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Health Analyzer")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "https://ai-health-analyzer-jade.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    """Root endpoint - welcome message."""
    return {
        "message": "AI Health Analyzer API",
        "version": "1.0",
        "docs": "http://localhost:8000/docs",
        "health": "http://localhost:8000/health"
    }


@app.get("/health")
def health():
    """Health check endpoint."""
    return {"status": "ok"}


# ==================== USERS ====================

@app.post("/users/", response_model=User)
def create_user_endpoint(user: UserCreate, db: Session = Depends(get_db)):
    """Create a new user."""
    return create_user(db, user)


@app.get("/users/{username}", response_model=User)
def read_user(username: str, db: Session = Depends(get_db)):
    """Get a user by username."""
    user = get_user(db, username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


# ==================== ENTRIES ====================

@app.post("/entries/", response_model=DailyEntry)
def create_entry_endpoint(
    entry: DailyEntryCreate,
    username: str = Query(..., description="Your username"),
    db: Session = Depends(get_db),
):
    """Create a new daily entry for a user."""
    return create_entry(db, entry, username)


@app.get("/entries/{username}", response_model=list[DailyEntry])
def read_entries(
    username: str = Path(..., description="Username"),
    skip: int = 0,
    limit: int = Query(10, le=50),
    db: Session = Depends(get_db),
):
    """Get all entries for a user with pagination."""
    return get_entries(db, username, skip, limit)


# ==================== STATS ====================

@app.get("/stats/{username}", response_model=StatsResponse)
def read_stats(
    username: str = Path(..., description="Username"),
    db: Session = Depends(get_db),
):
    """Get stats for a user (mood, energy averages, trend)."""
    return get_stats(db, username)


@app.get("/insights/{username}", response_model=InsightsResponse)
def read_insights(
    username: str = Path(..., description="Username"),
    db: Session = Depends(get_db),
):
    """Get AI-generated insights for a user based on their mood/energy data."""
    return compute_insights(db, username)


@app.get("/count/{username}")
def read_count(username: str, db: Session = Depends(get_db)):
    """Get total entry count for a user."""
    return {"count": get_user_entries_count(db, username)}

