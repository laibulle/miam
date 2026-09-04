from pathlib import Path

from dotenv import load_dotenv
from google.adk.cli.fast_api import get_fast_api_app

from app.adapters.inbound.web.adk_access import RequireAdkAccount
from app.adapters.inbound.web.auth import auth_router
from app.adapters.inbound.web.auth_settings import AuthSettings
from app.adapters.inbound.web.static_files import ExpoStaticFiles

WEB_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = WEB_DIR.parents[3]

load_dotenv(PROJECT_ROOT / "app" / ".env")
auth_settings = AuthSettings.from_env()
app = get_fast_api_app(
    agents_dir=str(PROJECT_ROOT / "app"),
    web=False,
    allow_origins=list(auth_settings.allowed_origins),
)

# Capture every ADK route before adding public sign-in and static assets.
app.add_middleware(RequireAdkAccount, settings=auth_settings, routes=list(app.routes))
app.include_router(auth_router(auth_settings))

# Mount last so the ADK API and FastAPI documentation keep their routes.
app.mount(
    "/",
    ExpoStaticFiles(directory=PROJECT_ROOT / "front" / "dist", html=True, check_dir=False),
    name="frontend",
)
