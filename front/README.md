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
4. Set `EXPO_PUBLIC_GOOGLE_SESSION_PATH` to an **existing same-origin** session
   endpoint matching the contract below. Restart Expo after changing variables.
   Both values are required to enable the button; no endpoint is guessed.

### Session API contract to connect

No authentication endpoint is implemented in this repository yet. The frontend
is prepared for `POST <EXPO_PUBLIC_GOOGLE_SESSION_PATH>` with JSON
`{ "credential": "<Google ID token>" }` and the header `X-Requested-With: Miam`.
The server must reject untrusted origins, require this header and JSON content
type, verify Google's signature, issuer, audience and expiration, then establish
its own session using an HttpOnly, Secure (production), SameSite cookie.
Return **204 No Content only after the session has been established**; other
statuses are treated as failure. Adapt this frontend contract if the actual
authentication service uses a different protocol.

An account is required to use Miam. `/profile`, `/home` and `/recipe` are protected
by Expo Router; direct links return to the sign-in screen until the server confirms
a session. After confirmation the app opens `/profile`. There is no guest button
or onboarding shortcut. Without configured authentication, access stays blocked,
including on native platforms where sign-in has not been integrated yet.

The authentication flag is kept in memory only. Reloading the app requires signing
in again until a server session-restoration endpoint is available. Google tokens are not
decoded as proof of authentication, logged, stored in browser storage or attached
to ADK requests. The default ADK routes are unchanged. The UI guard is not API
authorization: the backend must still reject unauthenticated requests and bind
accounts to sessions before this can be deployed as an account-only service.

The Expo development proxy currently forwards ADK routes only. To test real
authentication, serve the exported frontend on the same origin as the session
endpoint, or add a development proxy for that confirmed endpoint. Do not point
the configuration at an arbitrary static page.

### Docker configuration

Expo embeds public configuration at **build time**, so `docker run -e` cannot
change it after export. Build from the repository root with:

```bash
docker build \
  --build-arg EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID="$EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID" \
  --build-arg EXPO_PUBLIC_GOOGLE_SESSION_PATH="$EXPO_PUBLIC_GOOGLE_SESSION_PATH" \
  -t miam .
```

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
