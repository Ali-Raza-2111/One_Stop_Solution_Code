from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_NAME:     str = "One Stop Solution API"
    APP_VERSION:  str = "0.1.0"
    DEBUG:        bool = True
    HOST:         str = "0.0.0.0"
    PORT:         int = 8000
    SECRET_KEY:   str = "change-me-in-production-please-use-a-long-random-string"
    DATABASE_URL: str = "sqlite:///./app.db"

    # Comma-separated list of allowed CORS origins
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001,http://localhost:5173,http://127.0.0.1:5173"


settings = Settings()
