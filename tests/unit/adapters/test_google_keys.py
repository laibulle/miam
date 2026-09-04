from types import SimpleNamespace
from unittest.mock import patch

import pytest

from app.adapters.outbound.google_keys import CachedGoogleRequest

URL = "https://www.googleapis.com/oauth2/v1/certs"


def test_certificate_cache_respects_max_age_and_google_age():
    response = SimpleNamespace(
        status=200, headers={"cache-control": "public, max-age=60", "age": "10"}
    )
    request = CachedGoogleRequest()
    with (
        patch(
            "app.adapters.outbound.google_keys.GoogleRequest.__call__", return_value=response
        ) as fetch,
        patch("app.adapters.outbound.google_keys.time.monotonic", return_value=100) as now,
    ):
        assert request(URL) is response
        now.return_value = 149
        assert request(URL) is response
        assert fetch.call_count == 1
        now.return_value = 150
        request(URL)
        assert fetch.call_count == 2
        assert fetch.call_args.kwargs["timeout"] == 5


@pytest.mark.parametrize(
    "status, control",
    [
        (503, "max-age=600"),
        (200, "no-store, max-age=600"),
        (200, "no-cache, max-age=600"),
        (200, ""),
    ],
)
def test_does_not_cache_errors_or_noncacheable_keys(status, control):
    response = SimpleNamespace(status=status, headers={"cache-control": control})
    request = CachedGoogleRequest()
    with patch(
        "app.adapters.outbound.google_keys.GoogleRequest.__call__", return_value=response
    ) as fetch:
        request(URL)
        request(URL)
    assert fetch.call_count == 2


def test_certificate_cache_never_exceeds_five_minutes():
    response = SimpleNamespace(status=200, headers={"cache-control": "max-age=3600"})
    request = CachedGoogleRequest()
    with (
        patch(
            "app.adapters.outbound.google_keys.GoogleRequest.__call__", return_value=response
        ) as fetch,
        patch("app.adapters.outbound.google_keys.time.monotonic", return_value=0) as now,
    ):
        request(URL)
        now.return_value = 300
        request(URL)
    assert fetch.call_count == 2
