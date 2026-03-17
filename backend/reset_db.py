"""
Reset the database - drop and recreate all tables
"""
from db import engine, Base
from models import User, DailyEntry
from sqlalchemy import text

def reset_db():
    """Drop all tables and recreate them"""
    print("Dropping existing tables...")
    Base.metadata.drop_all(bind=engine)
    print("Creating fresh database tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Database reset successfully!")

if __name__ == "__main__":
    reset_db()
