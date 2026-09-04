"""Verify bearer credentials and expose the authenticated account over HTTP."""

from fastapi import APIRouter, HTTPException, Request
from starlette.responses import JSONResponse

from app.adapters.inbound.web.auth_settings import AuthSettings
from app.adapters.outbound.google_identity import verify_google_credential


def authenticate(authorization: str | None, settings: AuthSettings) -> str:
    scheme, _, credential = (authorization or "").partition(" ")
    if scheme.lower() != "bearer" or not credential or len(credential) > 16384:
        raise HTTPException(401, "Authentication required.", headers={"WWW-Authenticate": "Bearer"})
    try:
        return verify_google_credential(credential, settings.client_id, settings.allowed_emails)
    except PermissionError:
        raise HTTPException(403, "Account is not allowed.") from None
    except ValueError:
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
