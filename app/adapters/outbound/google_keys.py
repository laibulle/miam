"""Short-lived cache of Google's public certificates, never of user tokens."""

import re
import time
from threading import Lock

from google.auth.transport.requests import Request as GoogleRequest


class CachedGoogleRequest(GoogleRequest):
    def __init__(self):
        super().__init__()
        self._lock = Lock()
        self._cached = None
        self._url = None
        self._expires_at = 0

    def __call__(self, url, method="GET", **kwargs):
        with self._lock:
            if method == "GET" and url == self._url and time.monotonic() < self._expires_at:
                return self._cached
            kwargs["timeout"] = 5
            response = super().__call__(url, method=method, **kwargs)
            control = response.headers.get("cache-control", "").lower()
            max_age = re.search(r'(?:^|,)\s*max-age="?(\d+)', control)
            age = response.headers.get("age", "0")
            if (
                method == "GET"
                and response.status == 200
                and max_age
                and age.isdigit()
                and "no-store" not in control
                and "no-cache" not in control
            ):
                # Respect Google's cache lifetime, capped at five minutes per worker.
                ttl = max(0, min(300, int(max_age[1]) - int(age)))
                self._url, self._cached = url, response
                self._expires_at = time.monotonic() + ttl
            return response
