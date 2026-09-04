# Miam

[![codecov](https://codecov.io/github/laibulle/miam/graph/badge.svg?token=37WFH88IPK)](https://codecov.io/github/laibulle/miam)

Miam is a tool that help you find a meal recipe according to your tastes, diet, 
location and the current season.

It is powered by ADK and runs on gcp.

__What do we know ?__

- Frontier models have enough knowledge to know what mediterranean/italian/japon is
- We should not rely on models to compute food info
- We should not rely on models to provide recipes and foods substitutions

__ What don't we know ?__

- How to retrieve food facts according to an agent requirements
- The exact agents topology to achieve our goal
- How to observe our agents communications

## Getting started 🏁

```bash
cp app/.env.dist app/.env
make sync
make dev
```

The web UI is the Expo app in `front/`. Build it before opening FastAPI in a
browser (and rebuild after frontend changes):

```bash
cd front
npm ci
npm run build:web
```

FastAPI serves `front/dist/` at `/`, including direct links such as `/home` and
`/recipe`. ADK routes and `/docs` remain available. The previous HTML UI has been
removed.

`make docker-build` builds the Expo web export in a Node stage and copies only
the generated frontend into the Python image. `make docker-run` serves it on
port 8080. Secrets must be provided at runtime; local environment files and ADK
sessions are excluded from the build context.

The Expo `/api/recipes` proxy runs only in its development server. A static
export does not execute that route: recipe generation in the Docker-served UI
requires a backend implementing `POST /api/recipes`. Serving these files does
not add that API adapter; the existing ADK API remains unchanged.

## Roadmap 🛣️

- [x] Setup project architecture
- [x] Setup quality tools
- [x] Setup tests
- [x] Setup Dockerfile
- [x] Define UI
- [x] Define data structures 
- [x] Implement naive agent
- [ ] Add Eval
- [ ] Define guardrails
- [ ] Define tools
- [ ] Implement naive agent with tools and eval
- [ ] Implement multiple agents with tools and eval
- [ ] Setup cloudrun

__Sample for for adk web__

```json
{
  "prompt": "I want a healthy meal with french fries and a sauce",
  "activity_level": 2,
  "age": 35,
  "gender": "male",
  "height_cm": 180,
  "weight_kg": 75,
  "sports": ["running", "cycling"],
  "country": "France",
  "month": 9
}
```
