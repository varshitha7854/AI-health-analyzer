"""
Initialize the database - create all tables
"""
from db import engine, Base
from models import User, DailyEntry

def init_db():
    """Create all tables defined in models"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully!")

if __name__ == "__main__":
    init_db()
