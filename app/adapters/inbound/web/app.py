from pathlib import Path

from google.adk.cli.fast_api import get_fast_api_app

from app.adapters.inbound.web.static_files import ExpoStaticFiles

WEB_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = WEB_DIR.parents[3]

app = get_fast_api_app(
    agents_dir=str(PROJECT_ROOT / "app"),
    web=False,
)

# Mount last so the ADK API and FastAPI documentation keep their routes.
app.mount(
    "/",
    ExpoStaticFiles(directory=PROJECT_ROOT / "front" / "dist", html=True, check_dir=False),
    name="frontend",
)
