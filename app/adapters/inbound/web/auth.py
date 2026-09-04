"""Google identity verification and opaque, server-side browser sessions."""

import hashlib
import os
import re
import secrets
import sqlite3
import time
from contextlib import contextmanager
from dataclasses import dataclass
from pathlib import Path

from fastapi import APIRouter, HTTPException, Request, Response
from google.auth.exceptions import GoogleAuthError, TransportError
from google.auth.transport.requests import Request as GoogleRequest
from google.oauth2 import id_token
from pydantic import BaseModel, Field
from starlette.concurrency import run_in_threadpool
from starlette.responses import JSONResponse
from starlette.routing import Match

SESSION_TTL = 8 * 60 * 60


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


class BoundedGoogleRequest(GoogleRequest):
    def __call__(self, *args, **kwargs):
        kwargs["timeout"] = 5
        return super().__call__(*args, **kwargs)


def verify_google_credential(credential: str, client_id: str) -> str:
    # google-auth verifies signature, issuer, audience and expiry against Google's keys.
    claims = id_token.verify_oauth2_token(credential, BoundedGoogleRequest(), client_id)
    subject = claims.get("sub")
    if not isinstance(subject, str) or not 1 <= len(subject) <= 255:
        raise ValueError("Missing Google subject")
    return "google-" + hashlib.sha256(subject.encode()).hexdigest()


def check_origin(request: Request, settings: AuthSettings):
    if (
        request.headers.get("origin") not in settings.allowed_origins
        or request.headers.get("x-requested-with") != "Miam"
    ):
        raise HTTPException(403, "Origine non autorisée.")


class GoogleCredential(BaseModel):
    credential: str = Field(min_length=1, max_length=16384)


def auth_router(settings: AuthSettings, sessions: SessionStore):
    router = APIRouter(prefix="/auth", tags=["authentication"])

    @router.post("/google", status_code=204)
    def google_login(payload: GoogleCredential, request: Request):
        if not settings.client_id or not settings.allowed_origins:
            raise HTTPException(503, "La connexion Google n'est pas configurée.")
        check_origin(request, settings)
        if request.headers.get("content-type", "").split(";")[0].strip() != "application/json":
            raise HTTPException(415, "JSON requis.")
        try:
            user_id = verify_google_credential(payload.credential, settings.client_id)
        except TransportError:
            raise HTTPException(503, "Google est temporairement indisponible.") from None
        except ValueError, GoogleAuthError:
            raise HTTPException(401, "Identité Google invalide.") from None
        token = sessions.create(user_id, request.cookies.get(settings.cookie_name))
        response = Response(status_code=204, headers={"Cache-Control": "no-store"})
        response.set_cookie(
            settings.cookie_name,
            token,
            max_age=SESSION_TTL,
            httponly=True,
            secure=settings.secure_cookie,
            samesite="lax",
            path="/",
        )
        return response

    @router.get("/session")
    def current_session(request: Request):
        user_id = sessions.user(request.cookies.get(settings.cookie_name))
        if not user_id:
            raise HTTPException(401, "Connexion requise.")
        return JSONResponse({"user_id": user_id}, headers={"Cache-Control": "no-store"})

    @router.delete("/session", status_code=204)
    def logout(request: Request):
        check_origin(request, settings)
        sessions.revoke(request.cookies.get(settings.cookie_name))
        response = Response(status_code=204, headers={"Cache-Control": "no-store"})
        response.delete_cookie(
            settings.cookie_name,
            path="/",
            secure=settings.secure_cookie,
            httponly=True,
            samesite="lax",
        )
        return response

    return router


class RequireAdkAccount:
    """Guard the registered ADK endpoints, including websocket and debug routes.

    Only the recipe run and per-user session APIs are exposed to signed-in users.
    Other ADK admin/debug surfaces stay unavailable, even after login.
    """

    def __init__(self, app, settings: AuthSettings, sessions: SessionStore, routes):
        self.app, self.settings, self.sessions, self.routes = app, settings, sessions, routes

    async def __call__(self, scope, receive, send):
        if scope["type"] not in ("http", "websocket") or not any(
            route.matches(scope)[0] != Match.NONE for route in self.routes
        ):
            return await self.app(scope, receive, send)
        if scope["type"] == "websocket":
            await send({"type": "websocket.close", "code": 1008})
            return
        request = Request(scope, receive)
        user_id = await run_in_threadpool(
            self.sessions.user, request.cookies.get(self.settings.cookie_name)
        )
        status = 401
        if user_id:
            status = 403
            path = scope["path"]
            session_path = re.fullmatch(r"/apps/[^/]+/users/([^/]+)/sessions(?:/[^/]+)?", path)
            allowed = session_path and session_path[1] == user_id
            if request.method not in ("GET", "HEAD"):
                try:
                    check_origin(request, self.settings)
                except HTTPException:
                    allowed = False
                else:
                    if path in ("/run", "/run_sse"):
                        try:
                            body = await request.body()
                            data = await request.json()
                            allowed = isinstance(data, dict) and data.get("user_id") == user_id
                        except ValueError:
                            allowed = False
                        # Replay the consumed request for ADK without changing its protocol.
                        replayed = False

                        async def replay():
                            nonlocal replayed
                            if not replayed:
                                replayed = True
                                return {"type": "http.request", "body": body, "more_body": False}
                            return await receive()

                        if allowed:
                            return await self.app(scope, replay, send)
            if allowed:
                return await self.app(scope, receive, send)
        response = JSONResponse(
            {"detail": "Connexion requise." if status == 401 else "Accès interdit."},
            status_code=status,
            headers={"Cache-Control": "no-store"},
        )
        await response(scope, receive, send)
