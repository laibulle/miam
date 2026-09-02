IMAGE_NAME=laibulle/miam:latest

sync:
	uv sync

coverage:
	uv run pytest

test:
	uv run pytest --no-cov

dev:
	uv run fastapi dev

run-agent:
	uv run adk run src/miam_agent


docker-build:
	docker build -t ${IMAGE_NAME} .

docker-run:
	docker run --rm -it -p 8080:8080 ${IMAGE_NAME}

.PHONY: coverage test run-agent