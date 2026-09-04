"""Google client and allowed browser origins."""

import os
from dataclasses import dataclass


@dataclass(frozen=True)
class AuthSettings:
    client_id: str
    allowed_origins: frozenset[str]

    @classmethod
    def from_env(cls):
        client_id = os.environ["GOOGLE_WEB_CLIENT_ID"].strip()
        if not client_id:
            raise RuntimeError("GOOGLE_WEB_CLIENT_ID must be configured")
        return cls(
            client_id=client_id,
            allowed_origins=frozenset(
                origin.strip().rstrip("/")
                for origin in os.getenv("AUTH_ALLOWED_ORIGINS", "").split(",")
                if origin.strip()
            ),
        )
