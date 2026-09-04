// Imported exclusively by Expo's development API routes, never by the client.
export async function proxyAdk(request: Request): Promise<Response> {
  const path = new URL(request.url).pathname;
  if (path !== '/run' && !/^\/apps\/[a-zA-Z0-9_-]+\/users\/[a-zA-Z0-9_-]+\/sessions$/.test(path)) {
    return new Response(null, { status: 404 });
  }
  const baseUrl = (process.env.ADK_API_URL ?? 'http://127.0.0.1:8000').replace(/\/$/, '');
  try {
    const response = await fetch(`${baseUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: await request.text(),
      signal: request.signal,
      redirect: 'error',
    });
    return new Response(response.body, {
      status: response.status,
      headers: { 'Content-Type': response.headers.get('Content-Type') ?? 'application/json' },
    });
  } catch {
    return Response.json({ detail: 'Backend ADK indisponible.' }, { status: 502 });
  }
}
