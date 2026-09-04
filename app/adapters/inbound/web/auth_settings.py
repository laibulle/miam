"""Google client and allowed browser origins."""

import os
from dataclasses import dataclass


@dataclass(frozen=True)
class AuthSettings:
    client_id: str
    allowed_origins: frozenset[str]

    @classmethod
    def from_env(cls):
        return cls(
            client_id=os.getenv("GOOGLE_WEB_CLIENT_ID", "").strip(),
            allowed_origins=frozenset(
                origin.strip().rstrip("/")
                for origin in os.getenv("AUTH_ALLOWED_ORIGINS", "").split(",")
                if origin.strip()
            ),
        )
