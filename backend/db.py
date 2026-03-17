from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from config import settings

# Create the SQLAlchemy engine.
engine = create_engine(settings.DATABASE_URL)

# Create a customized Session class.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for our models.
Base = declarative_base()

def get_db():
    """Dependency to get the database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
