# Miam — front

Expo / React Native app implementing the "Miam — Warm Wellbeing" design from Penpot.

## Stack

Expo + React Native + React Native Web, TypeScript, Expo Router, Zustand, Zod, Storybook, Jest (`jest-expo`) + React Native Testing Library. See the root `CLAUDE.md` for the full architecture and rules.

## Getting started

```bash
npm install
npm run start        # Expo dev server (press i/a/w for iOS/Android/web)
npm run build:web    # Static web export to dist/, served by FastAPI / Docker
npm test              # Jest unit + component tests
npm run storybook      # On-device Storybook (component catalogue)
```

The Docker image builds this export automatically. FastAPI serves the exported
pages and assets at `/` and exposes the standard ADK API on the same origin.

The client adapter calls `POST /apps/{app_name}/users/{user_id}/sessions`, then
`POST /run`, and validates the final `editor_agent` event. The application name
defaults to `app`; set `EXPO_PUBLIC_ADK_APP_NAME` to target another ADK app.

In Expo web development, `app/run+api.ts` and the matching session API route
transparently forward the same paths, bodies and responses. They contain no
recipe logic. Set server-only `ADK_API_URL` to select the backend (default
`http://127.0.0.1:8000`). These proxy routes are not included in the static export;
production requests go straight to FastAPI's existing ADK routes.

For a native app or a separately hosted frontend, set `EXPO_PUBLIC_API_URL` to
the ADK server base URL. Public Expo variables are build-time configuration and
must never contain credentials. A separately hosted web frontend requires the
backend to allow its origin.

## Structure

```text
app/              Expo Router routes (the 5 screens from Penpot)
src/
  domain/         Zod schemas + pure logic (no React/Zustand/adapters)
  adapters/       fetch-based API client, Zod-validated
  features/       Zustand stores + hooks (profile, recipe generation, timer)
  components/
    ui/           generic stateless components (Button, Chip, Badge, ...)
    domain/       domain-specific stateless components (IngredientRow, ...)
```

## Screens

1. `/` — Bienvenue (onboarding welcome)
2. `/profile` — Profil & réglages (also reachable as settings from Accueil)
3. `/home` — Accueil (prompt composer, one recipe generated on demand)
4. `/refine` — Affiner la demande (per-generation refinements)
5. `/recipe` — Recette (generated recipe, steps with inline/floating timers)
