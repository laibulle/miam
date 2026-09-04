"""Authentication and ownership checks for the registered ADK routes."""

import re

from fastapi import FastAPI, HTTPException, Request
from starlette.concurrency import run_in_threadpool
from starlette.responses import JSONResponse
from starlette.routing import Match

from app.adapters.inbound.web.auth import authenticate
from app.adapters.inbound.web.auth_settings import AuthSettings

SESSION_PATH = re.compile(r"/apps/[^/]+/users/([^/]+)/sessions(?:/[^/]+)?")


async def check_owner(request: Request, user_id: str):
    session = SESSION_PATH.fullmatch(request.url.path)
    if session and session[1] == user_id:
        return
    if request.url.path in ("/run", "/run_sse") and request.method == "POST":
        try:
            body = await request.json()
        except ValueError:
            raise HTTPException(400, "Invalid JSON body.") from None
        if isinstance(body, dict) and body.get("user_id") == user_id:
            return
    raise HTTPException(403, "Access denied.")


class BlockAdkWebSockets:
    def __init__(self, app, routes):
        self.app, self.routes = app, routes

    async def __call__(self, scope, receive, send):
        if scope["type"] == "websocket" and any(
            route.matches(scope)[0] != Match.NONE for route in self.routes
        ):
            await send({"type": "websocket.close", "code": 1008})
            return
        await self.app(scope, receive, send)


def protect_adk(app: FastAPI, settings: AuthSettings):
    """Protect the ADK routes registered before this function is called."""
    adk_routes = tuple(app.routes)
    app.add_middleware(BlockAdkWebSockets, routes=adk_routes)

    @app.middleware("http")
    async def require_account(request: Request, call_next):
        if not any(route.matches(request.scope)[0] != Match.NONE for route in adk_routes):
            return await call_next(request)
        try:
            user_id = await run_in_threadpool(
                authenticate, request.headers.get("authorization"), settings
            )
            await check_owner(request, user_id)
        except HTTPException as error:
            return JSONResponse(
                {"detail": error.detail},
                status_code=error.status_code,
                headers={"Cache-Control": "no-store", **(error.headers or {})},
            )
        return await call_next(request)
