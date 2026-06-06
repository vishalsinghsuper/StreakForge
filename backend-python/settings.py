from functools import lru_cache
from pathlib import Path
# pyrefly: ignore [missing-import]
from pydantic import BaseModel
import os


BASE_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseModel):
    app_name: str = "StreakForge API"
    sqlite_path: Path = BASE_DIR / "streakforge_api.db"
    auth_secret: str = "streakforge-local-dev-secret-change-me"
    session_days: int = 30
    cors_origins: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]

    oracle_user: str | None = None
    oracle_password: str | None = None
    oracle_dsn: str | None = None
    oracle_wallet_location: str | None = None
    oracle_wallet_password: str | None = None

    @property
    def using_oracle(self) -> bool:
        return bool(self.oracle_dsn)


def _split_csv(value: str | None, fallback: list[str]) -> list[str]:
    if not value:
        return fallback
    return [item.strip() for item in value.split(",") if item.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings(
        sqlite_path=Path(os.getenv("SQLITE_PATH", BASE_DIR / "streakforge_api.db")),
        auth_secret=os.getenv("AUTH_SECRET", os.getenv("AUTH_COOKIE_SECRET", "streakforge-local-dev-secret-change-me")),
        session_days=int(os.getenv("SESSION_DAYS", "30")),
        cors_origins=_split_csv(os.getenv("CORS_ORIGINS"), Settings().cors_origins),
        oracle_user=os.getenv("ORACLE_DB_USER") or os.getenv("ORACLE_USER"),
        oracle_password=os.getenv("ORACLE_DB_PASSWORD") or os.getenv("ORACLE_PASSWORD"),
        oracle_dsn=os.getenv("ORACLE_DB_DSN") or os.getenv("ORACLE_DSN"),
        oracle_wallet_location=os.getenv("ORACLE_WALLET_LOCATION"),
        oracle_wallet_password=os.getenv("ORACLE_WALLET_PASSWORD"),
    )
