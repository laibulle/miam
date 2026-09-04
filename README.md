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

The frontend uses ADK's standard routes directly: it creates a session with
`POST /apps/app/users/{user_id}/sessions`, then sends the prompt to `POST /run`
and validates the final `editor_agent` response. In Docker, FastAPI serves both
the exported UI and the standard ADK API on the same origin. During Expo web
development, a transparent proxy forwards these same paths to ADK (configured
with server-only `ADK_API_URL`, default `http://127.0.0.1:8000`). There is no
custom recipe endpoint. Model credentials remain server-side and are supplied
to the container at runtime.

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
