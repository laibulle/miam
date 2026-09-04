"""SQLite persistence, rotation and expiry of opaque login sessions."""

import hashlib
import re
import secrets
import sqlite3
import time
from contextlib import contextmanager
from pathlib import Path

SESSION_TTL = 8 * 60 * 60


class SessionStore:
    def __init__(self, path: Path):
        self.path = path

    @contextmanager
    def connection(self):
        self.path.parent.mkdir(parents=True, exist_ok=True)
        connection = sqlite3.connect(self.path, timeout=5)
        try:
            with connection:
                connection.execute(
                    "CREATE TABLE IF NOT EXISTS login_sessions "
                    "(token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL, expires INTEGER NOT NULL)"
                )
                yield connection
        finally:
            connection.close()

    def create(self, user_id: str, previous: str | None = None):
        token = secrets.token_urlsafe(32)
        with self.connection() as db:
            db.execute("DELETE FROM login_sessions WHERE expires <= ?", (int(time.time()),))
            if previous:
                db.execute(
                    "DELETE FROM login_sessions WHERE token_hash = ?", (self.digest(previous),)
                )
            db.execute(
                "INSERT INTO login_sessions VALUES (?, ?, ?)",
                (self.digest(token), user_id, int(time.time()) + SESSION_TTL),
            )
        return token

    @staticmethod
    def digest(token: str):
        return hashlib.sha256(token.encode()).hexdigest()

    def user(self, token: str | None):
        if not token or not re.fullmatch(r"[A-Za-z0-9_-]{43}", token):
            return None
        with self.connection() as db:
            row = db.execute(
                "SELECT user_id FROM login_sessions WHERE token_hash = ? AND expires > ?",
                (self.digest(token), int(time.time())),
            ).fetchone()
        return row[0] if row else None

    def revoke(self, token: str | None):
        if token:
            with self.connection() as db:
                db.execute("DELETE FROM login_sessions WHERE token_hash = ?", (self.digest(token),))
