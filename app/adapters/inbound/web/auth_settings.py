"""Google client, allowed accounts and browser origins."""

import os
from dataclasses import dataclass


@dataclass(frozen=True)
class AuthSettings:
    client_id: str
    allowed_origins: frozenset[str]
    allowed_emails: frozenset[str] = frozenset()

    @classmethod
    def from_env(cls):
        client_id = os.environ["GOOGLE_WEB_CLIENT_ID"].strip()
        if not client_id:
            raise RuntimeError("GOOGLE_WEB_CLIENT_ID must be configured")
        return cls(
            client_id=client_id,
            allowed_emails=frozenset(
                email.strip().lower()
                for email in os.getenv("AUTH_ALLOWED_EMAILS", "").split(",")
                if email.strip()
            ),
            allowed_origins=frozenset(
                origin.strip().rstrip("/")
                for origin in os.getenv("AUTH_ALLOWED_ORIGINS", "").split(",")
                if origin.strip()
            ),
        )
