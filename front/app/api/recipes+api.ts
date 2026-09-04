/**
 * Dev-time same-origin proxy to the ADK backend (out of scope here — see
 * CLAUDE.md — but confirmed live against the running `make dev` server):
 *
 *   1. POST /apps/{app_name}/users/{user_id}/sessions  -> { id: session_id }
 *   2. POST /run { app_name, user_id, session_id, new_message } -> Event[]
 *      new_message.parts[0].text is the raw PromptInput JSON — the
 *      "root_agent" Workflow's first node (fetch_foods_for_season) parses it
 *      straight into a PromptInput, no extra wrapping needed.
 *   3. The event authored by "editor_agent" (the workflow's last node) has
 *      content.parts[0].text holding a JSON string that already matches our
 *      RecipeResponse schema exactly (verified against a live run) — it is
 *      passed straight through as this route's response body.
 *
 * This also keeps the browser same-origin (see recipesApi.ts) which avoids
 * the CORS preflight the ADK server otherwise rejects with 403/404.
 *
 * ADK_APP_NAME/ADK_API_URL are server-only env vars (not EXPO_PUBLIC_) since
 * this code only ever runs in the Expo dev server / API route, never in the
 * client bundle.
 */

const ADK_API_URL = process.env.ADK_API_URL ?? 'http://127.0.0.1:8000';
const ADK_APP_NAME = process.env.ADK_APP_NAME ?? 'app';

function errorResponse(description: string, status: number) {
  return Response.json({ success: false, recipe: null, description }, { status });
}

export async function POST(request: Request) {
  const promptInputJson = await request.text();
  const userId = `web-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  let sessionResponse: Response;
  try {
    sessionResponse = await fetch(`${ADK_API_URL}/apps/${ADK_APP_NAME}/users/${userId}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    });
  } catch {
    return errorResponse('Impossible de contacter le backend Miam.', 502);
  }
  if (!sessionResponse.ok) {
    return errorResponse("Miam n'a pas pu démarrer de session.", 502);
  }
  const session = (await sessionResponse.json()) as { id: string };

  let runResponse: Response;
  try {
    runResponse = await fetch(`${ADK_API_URL}/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        app_name: ADK_APP_NAME,
        user_id: userId,
        session_id: session.id,
        new_message: { role: 'user', parts: [{ text: promptInputJson }] },
      }),
    });
  } catch {
    return errorResponse('Impossible de contacter le backend Miam.', 502);
  }
  if (!runResponse.ok) {
    return errorResponse("Miam n'a pas pu générer de recette.", 502);
  }

  const events = (await runResponse.json()) as Array<{
    author?: string;
    content?: { parts?: Array<{ text?: string }> };
  }>;
  const editorEvent = [...events].reverse().find((event) => event.author === 'editor_agent');
  const text = editorEvent?.content?.parts?.[0]?.text;
  if (!text) {
    return errorResponse("Miam n'a pas retourné de recette exploitable.", 502);
  }

  return new Response(text, { status: 200, headers: { 'Content-Type': 'application/json' } });
}
