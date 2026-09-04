FROM node:22-bookworm-slim AS frontend-build

WORKDIR /opt/front

ENV CI=1 \
    EXPO_NO_TELEMETRY=1 \
    EXPO_NO_DOTENV=1

COPY front/package.json front/package-lock.json ./
RUN npm ci --ignore-scripts --no-audit --no-fund

COPY front/ ./
# Public Google OAuth configuration is embedded by Expo at build time.
ARG EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
RUN npm run build:web

FROM python:3.14-slim-bookworm

COPY --from=ghcr.io/astral-sh/uv:0.12 /uv /uvx /bin/

WORKDIR /opt/app

COPY pyproject.toml uv.lock ./

RUN uv sync --locked --no-dev --no-install-project

COPY app/ ./app/
COPY --from=frontend-build /opt/front/dist/ ./front/dist/

RUN uv sync --locked --no-dev

ENV PATH="/opt/app/.venv/bin:$PATH"

EXPOSE 8080

CMD ["fastapi", "run", "--proxy-headers", "--port", "8080"]
