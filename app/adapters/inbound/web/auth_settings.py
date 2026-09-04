"""Authentication environment configuration and cookie naming."""

import os
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class AuthSettings:
    client_id: str
    allowed_origins: frozenset[str]
    database: Path
    secure_cookie: bool = True

    @classmethod
    def from_env(cls):
        return cls(
            client_id=os.getenv("GOOGLE_WEB_CLIENT_ID", "").strip(),
            allowed_origins=frozenset(
                origin.strip().rstrip("/")
                for origin in os.getenv("AUTH_ALLOWED_ORIGINS", "").split(",")
                if origin.strip()
            ),
            database=Path(os.getenv("AUTH_SESSION_DB", ".adk/auth.sqlite3")),
            secure_cookie=os.getenv("AUTH_COOKIE_SECURE", "true").lower() != "false",
        )

    @property
    def cookie_name(self):
        return "__Host-miam_session" if self.secure_cookie else "miam_session"
