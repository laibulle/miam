"""Authentication and ownership checks for the registered ADK routes."""

import re

from fastapi import HTTPException, Request
from starlette.concurrency import run_in_threadpool
from starlette.responses import JSONResponse
from starlette.routing import Match

from app.adapters.inbound.web.auth_settings import AuthSettings
from app.adapters.inbound.web.csrf import check_origin
from app.adapters.outbound.login_sessions import SessionStore


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
            {"detail": "Authentication required." if status == 401 else "Access denied."},
            status_code=status,
            headers={"Cache-Control": "no-store"},
        )
        await response(scope, receive, send)
