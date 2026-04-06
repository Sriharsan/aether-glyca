from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    GEMINI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""
    DATABASE_URL: str = "sqlite:///./aether_local.db"
    SECRET_KEY: str = "aether-glyca-dev-secret-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    FRONTEND_URL: str = "http://localhost:5173"
    APP_ENV: str = "development"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
