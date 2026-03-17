from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    """
    Application settings.
    Loads values from environment variables or a .env file.
    """

    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:postgres@localhost:5432/health_mood_db",
    )
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")

    class Config:
        env_file = ".env"

    @property
    def use_gemini(self) -> bool:
        return bool(self.GEMINI_API_KEY)

settings = Settings()
