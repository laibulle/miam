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

## Getting started 🏁

```bash
uv init
adk run miam_agent
```