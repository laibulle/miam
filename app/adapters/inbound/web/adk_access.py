"""Authentication and ownership checks for the registered ADK routes."""

import re

from fastapi import HTTPException, Request
from starlette.concurrency import run_in_threadpool
from starlette.responses import JSONResponse
from starlette.routing import Match

from app.adapters.inbound.web.auth import authenticate
from app.adapters.inbound.web.auth_settings import AuthSettings


class RequireAdkAccount:
    """Expose only recipe runs and the authenticated user's ADK sessions."""

    def __init__(self, app, settings: AuthSettings, routes):
        self.app, self.settings, self.routes = app, settings, routes

    async def __call__(self, scope, receive, send):
        if scope["type"] not in ("http", "websocket") or not any(
            route.matches(scope)[0] != Match.NONE for route in self.routes
        ):
            return await self.app(scope, receive, send)
        if scope["type"] == "websocket":
            await send({"type": "websocket.close", "code": 1008})
            return
        request = Request(scope, receive)
        try:
            user_id = await run_in_threadpool(
                authenticate, request.headers.get("authorization"), self.settings
            )
            path = scope["path"]
            session_path = re.fullmatch(r"/apps/[^/]+/users/([^/]+)/sessions(?:/[^/]+)?", path)
            allowed = session_path and session_path[1] == user_id
            if path in ("/run", "/run_sse") and request.method == "POST":
                body = await request.body()
                try:
                    data = await request.json()
                except ValueError:
                    raise HTTPException(400, "Invalid JSON body.") from None
                allowed = isinstance(data, dict) and data.get("user_id") == user_id
                # Replay the consumed body for ADK without changing its protocol.
                original_receive = receive
                replayed = False

                async def replay():
                    nonlocal replayed
                    if not replayed:
                        replayed = True
                        return {"type": "http.request", "body": body, "more_body": False}
                    return await original_receive()

                receive = replay
            if not allowed:
                raise HTTPException(403, "Access denied.")
        except HTTPException as error:
            response = JSONResponse(
                {"detail": error.detail},
                status_code=error.status_code,
                headers={"Cache-Control": "no-store", **(error.headers or {})},
            )
            return await response(scope, receive, send)
        return await self.app(scope, receive, send)
