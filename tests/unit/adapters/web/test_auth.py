import json
import time
from dataclasses import replace
from types import SimpleNamespace
from unittest.mock import patch

import pytest
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from fastapi import FastAPI, Request
from fastapi.testclient import TestClient
from google.auth import crypt, jwt
from google.auth.exceptions import TransportError
from starlette.websockets import WebSocketDisconnect

from app.adapters.inbound.web.adk_access import RequireAdkAccount
from app.adapters.inbound.web.auth import auth_router
from app.adapters.inbound.web.auth_settings import AuthSettings
from app.adapters.outbound.google_identity import verify_google_credential
from app.adapters.outbound.login_sessions import SessionStore

ORIGIN = "https://miam.test"
HEADERS = {"Origin": ORIGIN, "X-Requested-With": "Miam"}
OWNER = "google-" + "a" * 64


@pytest.fixture
def setup(tmp_path):
    settings = AuthSettings(
        "test.apps.googleusercontent.com", frozenset({ORIGIN}), tmp_path / "auth.db"
    )
    sessions = SessionStore(settings.database)
    app = FastAPI()

    @app.post("/run")
    @app.post("/run_sse")
    async def run(request: Request):
        return await request.json()

    @app.post("/apps/{app_name}/users/{user_id}/sessions")
    @app.get("/apps/{app_name}/users/{user_id}/sessions/{session_id}")
    def session():
        return {"id": "recipe-session"}

    @app.get("/debug/trace/session/{session_id}")
    def debug():
        return {"private": True}

    @app.websocket("/run_live")
    async def live(websocket):
        await websocket.accept()

    app.add_middleware(
        RequireAdkAccount, settings=settings, sessions=sessions, routes=list(app.routes)
    )
    app.include_router(auth_router(settings, sessions))

    @app.get("/")
    def welcome():
        return {"welcome": True}

    with TestClient(app, base_url=ORIGIN) as client:
        yield client, settings, sessions


def login(client):
    with patch("app.adapters.inbound.web.auth.verify_google_credential", return_value=OWNER):
        return client.post("/auth/google", headers=HEADERS, json={"credential": "test-token"})


def test_login_sets_opaque_secure_cookie_and_returns_204(setup):
    client, settings, sessions = setup
    response = login(client)
    assert response.status_code == 204
    assert response.content == b""
    assert response.headers["cache-control"] == "no-store"
    cookie = response.headers["set-cookie"]
    assert "HttpOnly" in cookie and "Secure" in cookie and "SameSite=lax" in cookie
    assert "Path=/" in cookie and "Domain=" not in cookie
    token = client.cookies[settings.cookie_name]
    assert "test-token" not in token
    assert token.encode() not in settings.database.read_bytes()
    assert sessions.user(token) == OWNER
    assert client.get("/auth/session").json() == {"user_id": OWNER}
    # A second worker/restart can use the same database.
    assert SessionStore(settings.database).user(token) == OWNER


@pytest.mark.parametrize(
    "headers", [{}, {"Origin": "https://evil.test", "X-Requested-With": "Miam"}, {"Origin": ORIGIN}]
)
def test_login_rejects_csrf_before_contacting_google(setup, headers):
    client, _, _ = setup
    with patch("app.adapters.inbound.web.auth.verify_google_credential") as verify:
        assert (
            client.post("/auth/google", headers=headers, json={"credential": "test"}).status_code
            == 403
        )
        verify.assert_not_called()


@pytest.mark.parametrize(
    "error, status",
    [(ValueError("private token data"), 401), (TransportError("private details"), 503)],
)
def test_failed_google_verification_does_not_create_session(setup, error, status):
    client, _, _ = setup
    with patch("app.adapters.inbound.web.auth.verify_google_credential", side_effect=error):
        response = client.post("/auth/google", headers=HEADERS, json={"credential": "test"})
    assert response.status_code == status
    assert "set-cookie" not in response.headers
    assert "private" not in response.text
    assert client.get("/auth/session").status_code == 401


def test_missing_configuration_stays_closed(setup):
    _, settings, sessions = setup
    app = FastAPI()
    app.include_router(auth_router(replace(settings, client_id=""), sessions))
    with TestClient(app) as client:
        assert (
            client.post("/auth/google", headers=HEADERS, json={"credential": "test"}).status_code
            == 503
        )


@pytest.mark.parametrize(
    "path, method",
    [
        ("/run", "post"),
        ("/run_sse", "post"),
        (f"/apps/app/users/{OWNER}/sessions", "post"),
        ("/debug/trace/session/s", "get"),
        ("/openapi.json", "get"),
    ],
)
def test_adk_requires_account_even_when_called_directly(setup, path, method):
    client, _, _ = setup
    assert getattr(client, method)(path).status_code == 401
    assert client.get("/").status_code == 200


def test_adk_binds_paths_and_run_body_to_authenticated_account(setup):
    client, _, _ = setup
    login(client)
    own_path = f"/apps/app/users/{OWNER}/sessions"
    assert client.post(own_path, headers=HEADERS, json={}).status_code == 200
    assert client.get(own_path + "/s").status_code == 200
    assert (
        client.post("/apps/app/users/other/sessions", headers=HEADERS, json={}).status_code == 403
    )
    assert client.get("/apps/app/users/other/sessions/s").status_code == 403
    for path in ("/run", "/run_sse"):
        body = {"user_id": OWNER, "session_id": "s", "new_message": {"text": "recipe"}}
        response = client.post(path, headers=HEADERS, json=body)
        assert response.status_code == 200
        assert response.json() == body  # Middleware preserves the default ADK body.
        assert client.post(path, headers=HEADERS, json={"user_id": "other"}).status_code == 403
        assert client.post(path, headers=HEADERS, json=[]).status_code == 403
        assert client.post(path, headers=HEADERS, content="invalid").status_code == 403
        assert client.post(path, json=body).status_code == 403
    assert client.get("/debug/trace/session/s").status_code == 403


def test_cookie_rotation_logout_and_expiry(setup):
    client, settings, sessions = setup
    login(client)
    old_token = client.cookies[settings.cookie_name]
    login(client)
    token = client.cookies[settings.cookie_name]
    assert old_token != token and sessions.user(old_token) is None
    assert client.delete("/auth/session").status_code == 403
    assert client.delete("/auth/session", headers=HEADERS).status_code == 204
    assert sessions.user(token) is None
    assert client.get("/auth/session").status_code == 401
    with patch("app.adapters.outbound.login_sessions.time.time", return_value=100):
        token = sessions.create(OWNER)
    assert sessions.user(token) is None
    assert sessions.user("invalid") is None
    assert sessions.user("a" * 43) is None


def test_google_verifier_uses_server_audience_and_stable_subject():
    with patch(
        "app.adapters.outbound.google_identity.id_token.verify_oauth2_token",
        return_value={"sub": "123"},
    ) as verify:
        first = verify_google_credential("token-a", "client-id")
        second = verify_google_credential("token-b", "client-id")
        assert first == second and first.startswith("google-")
        assert verify.call_args.args[2] == "client-id"
    with patch(
        "app.adapters.outbound.google_identity.id_token.verify_oauth2_token", return_value={}
    ):
        with pytest.raises(ValueError):
            verify_google_credential("token", "client-id")


@pytest.fixture(scope="module")
def signing_key():
    key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    private = key.private_bytes(
        serialization.Encoding.PEM, serialization.PrivateFormat.PKCS8, serialization.NoEncryption()
    )
    public = key.public_key().public_bytes(
        serialization.Encoding.PEM, serialization.PublicFormat.SubjectPublicKeyInfo
    )
    return crypt.RSASigner.from_string(private), public.decode()


@pytest.mark.parametrize("change", [None, "aud", "iss", "exp", "signature"])
def test_real_google_verifier_rejects_invalid_jwts_without_network(setup, signing_key, change):
    client, settings, _ = setup
    signer, public = signing_key
    now = int(time.time())
    claims = {
        "sub": "123",
        "aud": settings.client_id,
        "iss": "https://accounts.google.com",
        "iat": now - 60,
        "exp": now + 3600,
    }
    if change in ("aud", "iss"):
        claims[change] = "wrong"
    elif change == "exp":
        claims["exp"] = now - 1
    token = jwt.encode(signer, claims, key_id="test").decode()
    if change == "signature":
        header, payload, signature = token.split(".")
        signature = ("A" if signature[0] != "A" else "B") + signature[1:]
        token = f"{header}.{payload}.{signature}"
    response = SimpleNamespace(status=200, data=json.dumps({"test": public}).encode())
    with patch("app.adapters.outbound.google_identity.BoundedGoogleRequest") as transport:
        transport.return_value.return_value = response
        result = client.post("/auth/google", headers=HEADERS, json={"credential": token})
    assert result.status_code == (204 if change is None else 401)
    assert ("set-cookie" in result.headers) == (change is None)


def test_websocket_cannot_bypass_authentication(setup):
    client, _, _ = setup
    with pytest.raises(WebSocketDisconnect):
        with client.websocket_connect("/run_live"):
            pytest.fail("WebSocket should be rejected")
