"""Verify Google credentials and derive a stable account identifier."""

import hashlib

from google.auth.transport.requests import Request as GoogleRequest
from google.oauth2 import id_token


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
