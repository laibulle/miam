import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.adapters.inbound.web.static_files import ExpoStaticFiles


@pytest.fixture
def client(tmp_path):
    export = tmp_path / "dist"
    export.mkdir()
    (export / "index.html").write_text("<html>Welcome</html>")
    (export / "home.html").write_text("<html>Home</html>")
    (export / "_expo").mkdir()
    (export / "_expo" / "app.js").write_text("console.log('Miam');")
    private = tmp_path / "private.html"
    private.write_text("must not be served")
    (export / "escape.html").symlink_to(private)

    app = FastAPI()

    @app.post("/run")
    def run():
        return {"api": True}

    app.mount("/", ExpoStaticFiles(directory=export, html=True))
    with TestClient(app) as client:
        yield client


@pytest.mark.parametrize("path", ["/", "/index.html", "/home", "/home/", "/home.html"])
def test_serves_exported_pages(client, path):
    response = client.get(path)
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/html")
    assert response.text == (
        "<html>Welcome</html>" if path in ("/", "/index.html") else "<html>Home</html>"
    )


def test_serves_assets_and_conditional_requests(client):
    response = client.get("/_expo/app.js")
    assert response.status_code == 200
    assert "javascript" in response.headers["content-type"]
    assert response.text == "console.log('Miam');"
    cached = client.get("/_expo/app.js", headers={"If-None-Match": response.headers["etag"]})
    assert cached.status_code == 304
    assert client.head("/home").content == b""


@pytest.mark.parametrize(
    "path", ["/missing", "/_expo/missing.js", "/api/missing", "/%2e%2e/private", "/escape"]
)
def test_missing_files_and_escapes_return_404(client, path):
    response = client.get(path)
    assert response.status_code == 404
    assert "must not be served" not in response.text


def test_api_routes_take_precedence(client):
    assert client.post("/run").json() == {"api": True}
    assert client.get("/openapi.json").status_code == 200
    assert client.post("/home").status_code == 405
