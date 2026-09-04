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
4. The identity check route is fixed at `GET /auth/me`. Restart Expo after
   changing its public client ID.
5. Configure the backend in `app/.env` (or container environment):

   ```dotenv
   GOOGLE_WEB_CLIENT_ID=<same Web client ID as Expo>
   AUTH_ALLOWED_ORIGINS=http://localhost:8081,http://localhost:8000,http://localhost:8080
   ```

   Use HTTPS in production. `AUTH_ALLOWED_ORIGINS` controls CORS; it does not
   authenticate requests. No client secret or session signing key is needed.
   Missing backend client ID leaves authenticated requests unavailable (503).

### Bearer authentication

1. The Google button returns an ID token. The frontend sends it to `GET /auth/me`
   in `Authorization: Bearer <Google ID token>`.
2. Python verifies the signature, issuer, audience and expiry with `google-auth`
   and returns `{ "user_id": "google-..." }`. This does not create a login session.
3. The frontend keeps the token and verified user ID **in memory only**, and sends
   the bearer header on both standard ADK calls: session creation and `/run`.
4. Python verifies the token on **every request**, then checks that the ADK
   `user_id` matches the Google identity. Expired/invalid tokens receive **401**;
   another user's resources and ADK administrative/debug routes receive **403**.


The backend has no login-session database, login cookies or CSRF cookie checks.
Authentication is supplied explicitly in the bearer header, never by a cookie or
query parameter. Old login cookies are ignored, and the previous `/auth/google`
and `/auth/session` routes have been removed. Existing ADK conversation sessions
and their `google-...` owner identifiers are preserved.

An account remains required for `/profile`, `/home` and `/recipe`. With the
current Google button integration, there is no automatic token renewal: when an
API call receives **401**, the frontend discards the token and returns to sign-in.
Google ID tokens expire after about one hour. Reloading the page also requires
sign-in because the token is not persisted.

The profile includes a logout button. Logout discards the local token and clears
private profile/recipe state, including pending recipe requests. It does not
revoke the Google token: a copy remains usable until expiry.

`auth.py` handles bearer verification and the identity route; `adk_access.py`
handles access to ADK resources; `google_identity.py` delegates token validation
to Google. Configuration remains in
`auth_settings.py`. No Firebase or additional dependency is required.

Expo's development proxy forwards the same bearer header to FastAPI and does
not forward login cookies. Production requests go directly to FastAPI through
the same paths. ADK live WebSockets remain unavailable.

### Docker configuration

Expo embeds public configuration at **build time**, so `docker run -e` cannot
change it after export. Build from the repository root with:

```bash
docker build \
  --build-arg EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID="$EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID" \
  -t miam .
```

Pass the backend variables at runtime:

```bash
docker run --rm -p 8080:8080 --env-file app/.env miam
```

No login-session volume is required. `make docker-build` forwards the public
Google client ID from your shell environment.

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
