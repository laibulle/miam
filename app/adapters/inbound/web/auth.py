"""HTTP routes for Google login, current session and logout."""

from fastapi import APIRouter, HTTPException, Request, Response
from google.auth.exceptions import GoogleAuthError, TransportError
from pydantic import BaseModel, Field
from starlette.responses import JSONResponse

from app.adapters.inbound.web.auth_settings import AuthSettings
from app.adapters.inbound.web.csrf import check_origin
from app.adapters.outbound.google_identity import verify_google_credential
from app.adapters.outbound.login_sessions import SESSION_TTL, SessionStore


class GoogleCredential(BaseModel):
    credential: str = Field(min_length=1, max_length=16384)


def auth_router(settings: AuthSettings, sessions: SessionStore):
    router = APIRouter(prefix="/auth", tags=["authentication"])

    @router.post("/google", status_code=204)
    def google_login(payload: GoogleCredential, request: Request):
        if not settings.client_id or not settings.allowed_origins:
            raise HTTPException(503, "Google sign-in is not configured.")
        check_origin(request, settings)
        if request.headers.get("content-type", "").split(";")[0].strip() != "application/json":
            raise HTTPException(415, "JSON required.")
        try:
            user_id = verify_google_credential(payload.credential, settings.client_id)
        except TransportError:
            raise HTTPException(503, "Google is temporarily unavailable.") from None
        except ValueError, GoogleAuthError:
            raise HTTPException(401, "Invalid Google identity.") from None
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
            raise HTTPException(401, "Authentication required.")
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
