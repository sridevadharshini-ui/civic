import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "CIVICFLOW - Packaged Commodity Compliance & Inspection System"
    HACKATHON_NAME: str = "SMART INDIA HACKATHON 2026"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "civicflow-super-secret-jwt-key-sih2026-production-ready")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Database URL. Defaults to SQLite in local workspace if Postgres is not running
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite:///./civicflow.db"
    )

    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "./uploads")
    OCR_ENGINE: str = os.getenv("OCR_ENGINE", "tesseract")

    # CORS
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ]

    class Config:
        case_sensitive = True

settings = Settings()
