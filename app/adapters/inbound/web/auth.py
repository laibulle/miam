"""Verify bearer credentials and expose the authenticated account over HTTP."""

from fastapi import APIRouter, HTTPException, Request
from google.auth.exceptions import GoogleAuthError, TransportError
from starlette.responses import JSONResponse

from app.adapters.inbound.web.auth_settings import AuthSettings
from app.adapters.outbound.google_identity import verify_google_credential


def authenticate(authorization: str | None, settings: AuthSettings) -> str:
    scheme, _, credential = (authorization or "").partition(" ")
    if scheme.lower() != "bearer" or not credential or len(credential) > 16384:
        raise HTTPException(401, "Authentication required.", headers={"WWW-Authenticate": "Bearer"})
    if not settings.client_id:
        raise HTTPException(503, "Google sign-in is not configured.")
    try:
        return verify_google_credential(credential, settings.client_id)
    except TransportError:
        raise HTTPException(503, "Google is temporarily unavailable.") from None
    except ValueError, GoogleAuthError:
        raise HTTPException(
            401, "Invalid or expired Google identity.", headers={"WWW-Authenticate": "Bearer"}
        ) from None


def auth_router(settings: AuthSettings):
    router = APIRouter(prefix="/auth", tags=["authentication"])

    @router.get("/me")
    def current_account(request: Request):
        user_id = authenticate(request.headers.get("authorization"), settings)
        return JSONResponse({"user_id": user_id}, headers={"Cache-Control": "no-store"})

    return router
