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
pages and assets at `/` with direct page links supported. The development-only
`/api/recipes` proxy described below is not part of a static export; production
recipe generation needs a backend implementing that endpoint.

In dev, the client calls this app's own `/api/recipes` route (`app/api/recipes+api.ts`), which proxies server-side to the ADK backend (session create → `/run` → pull the `editor_agent` event) — this avoids both the cross-origin CORS preflight the ADK server rejects, and needing the client to know ADK's session/run protocol at all. Point it at your backend with `ADK_API_URL` (defaults to `http://127.0.0.1:8000`) and `ADK_APP_NAME` (defaults to `app`, matching `agents_dir`). To bypass the proxy and call a backend directly (e.g. from a native build with no dev-server proxy), set `EXPO_PUBLIC_API_URL` instead — note that target would then need to speak the `POST /api/recipes` contract itself, not raw ADK.

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
