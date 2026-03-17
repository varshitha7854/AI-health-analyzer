from sqlalchemy.orm import Session
from fastapi import HTTPException
from datetime import datetime, timedelta
from sqlalchemy import func
from models import User, DailyEntry
from schemas import UserCreate, DailyEntryCreate
from config import settings

# Optional import - Gemini API if available
try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False


def create_user(db: Session, user: UserCreate) -> User:
    """Create a new user. Raises 400 if user already exists."""
    username_lower = user.username.lower()
    db_user = db.query(User).filter(
        func.lower(User.username) == username_lower
    ).first()
    if db_user:
        raise HTTPException(status_code=400, detail="User already exists")
    
    new_user = User(username=username_lower)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


def get_user(db: Session, username: str) -> User | None:
    """Get user by username (case-insensitive)."""
    username_lower = username.lower()
    return db.query(User).filter(
        func.lower(User.username) == username_lower
    ).first()


def create_entry(db: Session, entry: DailyEntryCreate, username: str) -> DailyEntry:
    """Create a new daily entry. Raises 404 if user not found, 400 if validation fails."""
    user = get_user(db, username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Validate scores are 1-10
    if not (1 <= entry.mood_score <= 10):
        raise HTTPException(status_code=400, detail="mood_score must be between 1 and 10")
    if not (1 <= entry.energy <= 10):
        raise HTTPException(status_code=400, detail="energy must be between 1 and 10")
    
    # Validate date is not in the future
    if entry.date > datetime.now().date():
        raise HTTPException(status_code=400, detail="date cannot be in the future")
    
    new_entry = DailyEntry(
        user_id=user.id,
        date=entry.date,
        mood_score=entry.mood_score,
        energy=entry.energy,
        notes=entry.notes
    )
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)
    return new_entry


def get_entries(db: Session, username: str, skip: int = 0, limit: int = 10) -> list[DailyEntry]:
    """Get all entries for a user with pagination."""
    user = get_user(db, username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    entries = db.query(DailyEntry).filter(
        DailyEntry.user_id == user.id
    ).offset(skip).limit(limit).all()
    return entries


def get_stats(db: Session, username: str) -> dict:
    """Calculate stats for a user."""
    user = get_user(db, username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    today = datetime.now().date()
    thirty_days_ago = today - timedelta(days=30)
    fourteen_days_ago = today - timedelta(days=14)
    seven_days_ago = today - timedelta(days=7)
    
    # Get all entries from last 30 days
    all_entries = db.query(DailyEntry).filter(
        DailyEntry.user_id == user.id,
        DailyEntry.date >= thirty_days_ago
    ).all()
    
    # Get entries from last 7 days
    entries_7d = [e for e in all_entries if e.date >= seven_days_ago]
    
    # Get entries from 14-7 days ago (previous week)
    entries_prev_7d = [e for e in all_entries if fourteen_days_ago <= e.date < seven_days_ago]
    
    # Calculate averages
    total_entries = len(all_entries)
    
    avg_mood_7d = sum(e.mood_score for e in entries_7d) / len(entries_7d) if entries_7d else 0.0
    avg_energy_7d = sum(e.energy for e in entries_7d) / len(entries_7d) if entries_7d else 0.0
    avg_mood_30d = sum(e.mood_score for e in all_entries) / len(all_entries) if all_entries else 0.0
    avg_energy_30d = sum(e.energy for e in all_entries) / len(all_entries) if all_entries else 0.0
    
    # Calculate trend
    if len(entries_7d) >= 2 and len(entries_prev_7d) >= 2:
        avg_mood_prev = sum(e.mood_score for e in entries_prev_7d) / len(entries_prev_7d)
        if avg_mood_7d > avg_mood_prev:
            trend = "improving"
        elif avg_mood_7d < avg_mood_prev:
            trend = "declining"
        else:
            trend = "stable"
    else:
        trend = "stable"
    
    return {
        "avg_mood_7d": round(avg_mood_7d, 2),
        "avg_energy_7d": round(avg_energy_7d, 2),
        "avg_mood_30d": round(avg_mood_30d, 2),
        "avg_energy_30d": round(avg_energy_30d, 2),
        "total_entries": total_entries,
        "trend": trend
    }


def get_user_entries_count(db: Session, username: str) -> int:
    """Get total count of entries for a user."""
    user = get_user(db, username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    count = db.query(DailyEntry).filter(DailyEntry.user_id == user.id).count()
    return count


def compute_insights(db: Session, username: str) -> dict:
    """
    Generate AI insights using Gemini API based on user health data.
    Falls back to rule-based insights if API fails.
    Returns: {
        "messages": ["insight 1", "insight 2", ...],
        "weekly_summary": "brief overview of the week"
    }
    """
    user = get_user(db, username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    today = datetime.now().date()
    seven_days_ago = today - timedelta(days=7)
    thirty_days_ago = today - timedelta(days=30)
    
    # Fetch entries for analysis
    entries_7d = db.query(DailyEntry).filter(
        DailyEntry.user_id == user.id,
        DailyEntry.date >= seven_days_ago
    ).all()
    
    entries_30d = db.query(DailyEntry).filter(
        DailyEntry.user_id == user.id,
        DailyEntry.date >= thirty_days_ago
    ).all()
    
    # Return early if no data
    if not entries_30d:
        return {
            "messages": ["Start logging your mood and energy to get AI-powered insights!"],
            "weekly_summary": "No data yet. Begin tracking to see patterns."
        }
    
    # Use Gemini API if API key is configured and module is available
    if GEMINI_AVAILABLE and settings.GEMINI_API_KEY:
        try:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel(settings.GEMINI_MODEL)
            
            # Prepare data summary for Gemini
            avg_mood_7d = sum(e.mood_score for e in entries_7d) / len(entries_7d) if entries_7d else 0
            avg_energy_7d = sum(e.energy for e in entries_7d) / len(entries_7d) if entries_7d else 0
            avg_mood_30d = sum(e.mood_score for e in entries_30d) / len(entries_30d)
            avg_energy_30d = sum(e.energy for e in entries_30d) / len(entries_30d)
            
            today_entries = [e for e in entries_7d if e.date == today]
            today_mood = today_entries[0].mood_score if today_entries else None
            today_energy = today_entries[0].energy if today_entries else None
            
            # Build detailed prompt for Gemini
            prompt = f"""You are a compassionate wellness coach analyzing mood and energy data.

User Health Data (Last 7 days):
- Average Mood: {avg_mood_7d:.1f}/10
- Average Energy: {avg_energy_7d:.1f}/10
- Total entries: {len(entries_7d)}
{f"- Today's Mood: {today_mood}/10" if today_mood else ""}
{f"- Today's Energy: {today_energy}/10" if today_energy else ""}

Historical Trend (30 days):
- Average Mood: {avg_mood_30d:.1f}/10
- Average Energy: {avg_energy_30d:.1f}/10

Recent notes from user:
{'; '.join([e.notes for e in entries_7d if e.notes][:3]) or "No notes recorded."}

Please provide:
1. 2-3 brief, personalized wellness insights (1-2 sentences each, practical and supportive)
2. A one-sentence weekly summary

Format your response as:
INSIGHTS:
[insight 1]
[insight 2]
[optional insight 3]

SUMMARY:
[one sentence summary]"""

            response = model.generate_content(prompt)
            
            # Parse Gemini response
            response_text = response.text
            insights_section = response_text.split("INSIGHTS:\n")[1].split("\nSUMMARY:")[0].strip()
            summary_section = response_text.split("SUMMARY:\n")[1].strip()
            
            # Split insights into individual messages
            insight_messages = [msg.strip() for msg in insights_section.split("\n") if msg.strip() and not msg.startswith("[")]
            
            return {
                "messages": insight_messages[:3],
                "weekly_summary": summary_section
            }
        except Exception as e:
            # Fall back to rule-based insights on API error
            print(f"Gemini API error: {e}")
            return _compute_rule_based_insights(entries_7d, entries_30d)
    else:
        # Use rule-based insights if no API key
        return _compute_rule_based_insights(entries_7d, entries_30d)


def _compute_rule_based_insights(entries_7d: list, entries_30d: list) -> dict:
    """
    Generate rule-based insights (fallback when Gemini API is not available).
    """
    today = datetime.now().date()
    
    if not entries_30d:
        return {
            "messages": ["Start logging your mood and energy to get insights!"],
            "weekly_summary": "No data yet. Begin tracking to see patterns."
        }
    
    avg_mood_7d = sum(e.mood_score for e in entries_7d) / len(entries_7d) if entries_7d else 0
    avg_energy_7d = sum(e.energy for e in entries_7d) / len(entries_7d) if entries_7d else 0
    avg_mood_30d = sum(e.mood_score for e in entries_30d) / len(entries_30d)
    avg_energy_30d = sum(e.energy for e in entries_30d) / len(entries_30d)
    
    # Count negative days (mood <= 3)
    negative_days_7d = len([e for e in entries_7d if e.mood_score <= 3])
    
    # Today's entries (count and mood)
    today_entries = [e for e in entries_7d if e.date == today]
    today_mood = today_entries[0].mood_score if today_entries else None
    
    # Generate insights using simple rules
    messages = []
    
    # Insight 1: Today's mood vs average
    if today_mood:
        if today_mood > avg_mood_7d + 1:
            messages.append(
                f"Your mood today ({today_mood}) is higher than your 7-day average ({avg_mood_7d:.1f}). "
                "Something good happened—consider noting it to remember what helps!"
            )
        elif today_mood < avg_mood_7d - 1:
            messages.append(
                f"Your mood today ({today_mood}) is lower than usual. "
                "That's okay—tracking helps you learn patterns. Rest well and try self-care."
            )
        elif entries_7d:  # Only show if we have enough data
            messages.append(
                f"Your mood today ({today_mood}) is right on track with your 7-day average. "
                "Consistency in tracking shows great self-awareness!"
            )
    
    # Insight 2: Energy levels
    if entries_7d and avg_energy_7d < 5:
        messages.append(
            f"Your energy has been low lately (avg {avg_energy_7d:.1f}/10). "
            "Try adjusting sleep, exercise, or screen time. If it persists, consider consulting a professional."
        )
    elif entries_7d and avg_energy_7d >= 7:
        messages.append(
            f"Great energy levels this week (avg {avg_energy_7d:.1f}/10)! Keep up what you're doing."
        )
    
    # Insight 3: Negative days alert
    if negative_days_7d >= 3:
        messages.append(
            f"You've had {negative_days_7d} low-mood days in the last week. "
            "Consider talking to someone or trying stress-relief activities."
        )
    
    # Insight 4: Consistency
    if len(entries_7d) >= 5:
        messages.append(
            f"You've logged {len(entries_7d)} entries this week. "
            "Excellent consistency—data patterns will become clearer with your effort!"
        )
    
    # Weekly summary
    total_7d = len(entries_7d)
    low_days = len([e for e in entries_7d if e.mood_score <= 3])
    med_days = len([e for e in entries_7d if 4 <= e.mood_score <= 6])
    high_days = len([e for e in entries_7d if e.mood_score >= 7])
    
    # Extract common symptoms/notes
    all_notes = [e.notes for e in entries_7d if e.notes]
    notes_summary = "No notes yet." if not all_notes else f"Common themes: {', '.join(all_notes[:2])}"
    
    weekly_summary = (
        f"This week: {low_days} low days, {med_days} medium days, {high_days} high days. "
        f"Overall mood trend is {compute_trend(entries_7d, entries_30d)}. {notes_summary}"
    )
    
    return {
        "messages": messages[:3],  # Limit to 3 insights
        "weekly_summary": weekly_summary
    }


def compute_trend(entries_7d: list, entries_30d: list) -> str:
    """Helper: compute trend string."""
    if not entries_7d or not entries_30d:
        return "unknown"
    
    avg_7d = sum(e.mood_score for e in entries_7d) / len(entries_7d)
    avg_30d = sum(e.mood_score for e in entries_30d) / len(entries_30d)
    
    if avg_7d > avg_30d + 0.5:
        return "improving"
    elif avg_7d < avg_30d - 0.5:
        return "declining"
    else:
        return "stable"

