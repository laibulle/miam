"""Origin checks for browser requests that modify authenticated state."""

from fastapi import HTTPException, Request

from app.adapters.inbound.web.auth_settings import AuthSettings


def check_origin(request: Request, settings: AuthSettings):
    if (
        request.headers.get("origin") not in settings.allowed_origins
        or request.headers.get("x-requested-with") != "Miam"
    ):
        raise HTTPException(403, "Origin not allowed.")
