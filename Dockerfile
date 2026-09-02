FROM python:3.14-slim-bookworm

COPY --from=ghcr.io/astral-sh/uv:0.12 /uv /uvx /bin/

WORKDIR /opt/app

COPY pyproject.toml uv.lock ./

RUN uv sync --locked --no-install-project

COPY . .

RUN uv sync --locked

ENV PATH="/opt/app/.venv/bin:$PATH"

EXPOSE 8080

CMD ["fastapi", "run", "--proxy-headers", "--port", "8080"]