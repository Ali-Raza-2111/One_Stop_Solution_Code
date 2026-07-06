from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_NAME:     str = "My FastAPI App"
    APP_VERSION:  str = "0.1.0"
    DEBUG:        bool = True
    HOST:         str = "0.0.0.0"
    PORT:         int = 8000
    SECRET_KEY:   str = "change-me-in-production"
    DATABASE_URL: str = "sqlite:///./app.db"


settings = Settings()
