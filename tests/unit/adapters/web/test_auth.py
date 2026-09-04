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
from starlette.responses import StreamingResponse
from starlette.websockets import WebSocketDisconnect

from app.adapters.inbound.web.adk_access import protect_adk
from app.adapters.inbound.web.auth import auth_router
from app.adapters.inbound.web.auth_settings import AuthSettings
from app.adapters.outbound.google_identity import verify_google_credential

HEADERS = {"Authorization": "Bearer test-token"}
OWNER = "google-" + "a" * 64


@pytest.fixture
def setup():
    settings = AuthSettings("test.apps.googleusercontent.com", frozenset())
    app = FastAPI()

    @app.post("/run")
    async def run(request: Request):
        return await request.json()

    @app.post("/run_sse")
    async def run_sse(request: Request):
        body = await request.json()
        return StreamingResponse(
            iter([f"data: {body['user_id']}\n\n"]), media_type="text/event-stream"
        )

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

    protect_adk(app, settings)
    app.include_router(auth_router(settings))

    @app.get("/")
    def welcome():
        return {"welcome": True}

    with TestClient(app) as client:
        yield client, settings


def test_verified_identity_is_returned_without_creating_session(setup):
    client, settings = setup
    with patch(
        "app.adapters.inbound.web.auth.verify_google_credential", return_value=OWNER
    ) as verify:
        response = client.get("/auth/me", headers=HEADERS)
    assert response.status_code == 200
    assert response.json() == {"user_id": OWNER}
    assert response.headers["cache-control"] == "no-store"
    assert "set-cookie" not in response.headers
    verify.assert_called_once_with("test-token", settings.client_id)
    assert client.get("/auth/session").status_code == 404
    assert client.post("/auth/google").status_code == 404
    assert client.delete("/auth/session").status_code == 404


@pytest.mark.parametrize("header", ["", "Basic token", "Bearer", "Bearer " + "a" * 16385])
def test_invalid_authentication_header_rejected_before_google(setup, header):
    client, _ = setup
    with patch("app.adapters.inbound.web.auth.verify_google_credential") as verify:
        response = client.get("/auth/me", headers={"Authorization": header})
    assert response.status_code == 401
    assert response.headers["www-authenticate"] == "Bearer"
    verify.assert_not_called()


@pytest.mark.parametrize(
    "error, status",
    [(ValueError("private token data"), 401), (TransportError("private details"), 503)],
)
def test_failed_verification_blocks_account_and_adk(setup, error, status):
    client, _ = setup
    with patch("app.adapters.inbound.web.auth.verify_google_credential", side_effect=error):
        for response in (
            client.get("/auth/me", headers=HEADERS),
            client.post("/run", headers=HEADERS, json={"user_id": OWNER}),
        ):
            assert response.status_code == status
            assert "private" not in response.text
            assert "set-cookie" not in response.headers


def test_missing_configuration_stays_closed(setup):
    _, settings = setup
    app = FastAPI()
    app.include_router(auth_router(replace(settings, client_id="")))
    with TestClient(app) as client:
        assert client.get("/auth/me", headers=HEADERS).status_code == 503


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
def test_adk_requires_bearer_even_with_legacy_cookie(setup, path, method):
    client, _ = setup
    client.cookies.set("miam_session", "legacy-session")
    client.cookies.set("__Host-miam_session", "legacy-session")
    assert getattr(client, method)(path).status_code == 401
    assert client.get("/").status_code == 200


def test_every_request_is_verified_even_after_successful_sign_in(setup):
    client, _ = setup
    with patch("app.adapters.inbound.web.auth.verify_google_credential") as verify:
        verify.side_effect = [OWNER, OWNER, ValueError("expired")]
        assert client.get("/auth/me", headers=HEADERS).status_code == 200
        assert (
            client.post(f"/apps/app/users/{OWNER}/sessions", headers=HEADERS, json={}).status_code
            == 200
        )
        assert client.post("/run", headers=HEADERS, json={"user_id": OWNER}).status_code == 401
        assert verify.call_count == 3


def test_adk_ownership_and_request_body_preserved(setup):
    client, _ = setup
    with patch("app.adapters.inbound.web.auth.verify_google_credential", return_value=OWNER):
        own_path = f"/apps/app/users/{OWNER}/sessions"
        assert client.post(own_path, headers=HEADERS, json={}).status_code == 200
        assert client.get(own_path + "/s", headers=HEADERS).status_code == 200
        assert (
            client.post("/apps/app/users/other/sessions", headers=HEADERS, json={}).status_code
            == 403
        )
        assert client.get("/apps/app/users/other/sessions/s", headers=HEADERS).status_code == 403
        body = {"user_id": OWNER, "session_id": "s", "new_message": {"text": "recipe"}}
        assert client.post("/run", headers=HEADERS, json=body).json() == body
        stream = client.post("/run_sse", headers=HEADERS, json=body)
        assert stream.status_code == 200
        assert stream.text == f"data: {OWNER}\n\n"
        for path in ("/run", "/run_sse"):
            assert client.post(path, headers=HEADERS, json={"user_id": "other"}).status_code == 403
            assert client.post(path, headers=HEADERS, json=[]).status_code == 403
            assert client.post(path, headers=HEADERS, content="invalid").status_code == 400
        assert client.get("/debug/trace/session/s", headers=HEADERS).status_code == 403
        assert client.get("/openapi.json", headers=HEADERS).status_code == 403


def test_google_verifier_uses_server_audience_and_stable_subject():
    with patch(
        "app.adapters.outbound.google_identity.id_token.verify_oauth2_token",
        return_value={"sub": "123"},
    ) as verify:
        first = verify_google_credential("token-a", "client-id")
        second = verify_google_credential("token-b", "client-id")
        assert first == second and first.startswith("google-")
        assert verify.call_count == 2
        assert verify.call_args.args[2] == "client-id"
    with patch(
        "app.adapters.outbound.google_identity.id_token.verify_oauth2_token", return_value={}
    ):
        with pytest.raises(ValueError):
            verify_google_credential("token", "client-id")


def test_websocket_cannot_bypass_authentication(setup):
    client, _ = setup
    with pytest.raises(WebSocketDisconnect):
        with client.websocket_connect("/run_live", headers=HEADERS):
            pytest.fail("WebSocket should be rejected")


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
    client, settings = setup
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
    with patch("app.adapters.outbound.google_identity._google_request") as transport:
        transport.return_value = response
        result = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert result.status_code == (200 if change is None else 401)
    assert "set-cookie" not in result.headers
