from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime


class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=20)


class User(BaseModel):
    id: int
    username: str
    created_at: datetime

    class Config:
        from_attributes = True


class DailyEntryCreate(BaseModel):
    date: date
    mood_score: int = Field(..., ge=1, le=10)
    energy: int = Field(..., ge=1, le=10)
    notes: Optional[str] = None


class DailyEntry(BaseModel):
    id: int
    user_id: int
    date: date
    mood_score: int
    energy: int
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class StatsResponse(BaseModel):
    avg_mood_7d: float
    avg_energy_7d: float
    avg_mood_30d: float
    avg_energy_30d: float
    total_entries: int
    trend: str


class InsightsResponse(BaseModel):
    messages: List[str]
    weekly_summary: str

