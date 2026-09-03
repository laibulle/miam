IMAGE_NAME=laibulle/miam:latest
PYTHON_PATHS=app tests

sync:
	uv sync

coverage:
	uv run pytest

test:
	uv run pytest --no-cov

lint:
	uv run ruff check ${PYTHON_PATHS}

lint-fix:
	uv run ruff check --fix ${PYTHON_PATHS}

format:
	uv run ruff format ${PYTHON_PATHS}

format-check:
	uv run ruff format --check ${PYTHON_PATHS}

check: lint format-check test

dev:
	uv run fastapi dev

run-agent:
	uv run adk run app


docker-build:
	docker build -t ${IMAGE_NAME} .

docker-run:
	docker run --rm -it -p 8080:8080 ${IMAGE_NAME}

.PHONY: sync coverage test lint lint-fix format format-check check dev run-agent docker-build docker-run
