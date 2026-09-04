# Miam

[![codecov](https://codecov.io/github/laibulle/miam/graph/badge.svg?token=37WFH88IPK)](https://codecov.io/github/laibulle/miam)

Miam is a tool that help you find a meal recipe according to your tastes, diet, 
location and the current season.

It is powered by ADK and runs on gcp.

__What do we know ?__

- Frontier models have enough knowledge to know what mediterranean/italian/japon is
- We should not rely on models to compute food info
- We should not rely on models to provide recipes and foods substitutions

__What don't we know ?__

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

## Roadmap 🛣️

- [x] Setup project architecture
- [x] Setup quality tools
- [x] Setup tests
- [x] Setup Dockerfile
- [x] Define UI
- [x] Define data structures 
- [x] Implement multiple agents with tools
- [x] Setup cloudrun
- [x] GenAI UI
- [ ] Add Eval
- [ ] Add food facts DB for procedural accurate food fact computation
- [ ] User settings store
- [ ] Define guardrails
- [ ] Prod ready logging and observability


__Sample for adk web__

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
