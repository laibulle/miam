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

For authenticated web use, keep the frontend, `/auth/*` and ADK routes on the same
origin (directly or through the development proxy). Leave `EXPO_PUBLIC_API_URL`
unset in this setup. Cross-origin/native authentication is not implemented.
Public Expo variables are build-time configuration and must never contain secrets.

## Google Sign-In (Expo Web)

`react-native-nitro-google-signin` 2.1.0 supports native iOS/Android, not the
browser. Its `webClientId` option describes the OAuth client type, not web
platform support. The dependencies are retained for future native setup;
the welcome screen no longer imports Nitro during startup or static rendering.
Web uses the official Google Identity Services button through a browser-only
adapter, without an additional package.

1. In [Google Auth Platform](https://console.cloud.google.com/auth/clients),
   create an OAuth client of type **Web application**. Configure branding and
   audience/test users for the project.
2. Add `http://localhost`, `http://localhost:8081` and the actual Docker/public
   origins to **Authorized JavaScript origins**. Production must use HTTPS.
   This implementation uses a popup callback, so it needs no redirect page.
3. Copy `.env.example` to `.env.local` and fill in
   `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`. This ID is public; never include a client
   secret. `autoDetect` does not work in a browser.
4. The backend login route is fixed at `POST /auth/google`. Restart Expo after
   changing its public client ID.
5. Configure the backend in `app/.env` (or container environment):

   ```dotenv
   GOOGLE_WEB_CLIENT_ID=<same Web client ID as Expo>
   AUTH_ALLOWED_ORIGINS=http://localhost:8081,http://localhost:8000,http://localhost:8080
   AUTH_COOKIE_SECURE=false
   AUTH_SESSION_DB=.adk/auth.sqlite3
   ```

   `AUTH_COOKIE_SECURE=false` is for local HTTP only. Production uses HTTPS,
   `AUTH_COOKIE_SECURE=true` (the default), and the exact public origins in
   `AUTH_ALLOWED_ORIGINS`. No client secret or session signing key is needed.
   Missing backend configuration leaves login unavailable (503).

### Implemented session API

- `POST /auth/google`: JSON `{ "credential": "<Google ID token>" }`, with the
  browser's `Origin` and `X-Requested-With: Miam`. The server checks the origin,
  verifies the signature, issuer, audience and expiry using google-auth, creates
  an opaque session, and returns **204** with an HttpOnly, SameSite=Lax cookie
  (Secure and `__Host-` prefixed in production).
- `GET /auth/session`: returns `{ "user_id": "google-..." }` for a valid cookie,
  otherwise **401**. The frontend uses this identity for default ADK requests.
- `DELETE /auth/session`: requires the same origin/custom header checks, revokes
  the session and clears the cookie.

Sessions expire after eight hours. Only hashes of random session tokens and the
account identifier are stored in SQLite; Google tokens are not persisted. A new
login rotates the current session. Workers on the same host must share this
SQLite file; separate replicas need a shared session store before scaling out.

An account is required: `/profile`, `/home` and `/recipe` remain protected by
Expo Router. There is no guest flow. The backend also rejects anonymous ADK API
requests. The existing `/run`, `/run_sse` and per-user session routes retain their
ADK protocol, and the authenticated account must match `user_id` in the path or
body. Other ADK administrative/debug endpoints and live WebSocket execution are
not exposed to users. Static pages/assets and the sign-in routes stay reachable.

The frontend login flag is still in memory: reloading requires signing in again;
`GET /auth/session` is available for a future automatic restoration flow. A failed
or expired server session cannot generate recipes, even if the page is still open.

Expo's development API routes forward authentication and ADK requests, including
cookies and the browser's original origin. Login `Set-Cookie` headers are preserved.
These proxy routes are excluded from the static export: Docker serves the same
paths directly from FastAPI.

### Docker configuration

Expo embeds public configuration at **build time**, so `docker run -e` cannot
change it after export. Build from the repository root with:

```bash
docker build \
  --build-arg EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID="$EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID" \
  -t miam .
```

Pass the backend variables at runtime, and persist the session database:

```bash
docker run --rm -p 8080:8080 --env-file app/.env \
  -v miam-auth:/opt/app/.adk miam
```

Set the local HTTP cookie option when testing this container on localhost;
production requires secure cookies and an HTTPS origin. `make docker-build`
forwards the public Google client ID from your shell environment.

If the deployment sets CSP, allow the Google SDK and frames as described in
[Google's setup guide](https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid).
For popup support when FedCM is unavailable, check the deployment's COOP header
(`same-origin-allow-popups`). Validate tokens using the
[server verification guide](https://developers.google.com/identity/gsi/web/guides/verify-google-id-token).

Native sign-in still requires Nitro's Expo development build, platform OAuth
clients and config plugin; it is not enabled by this web integration.

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
