// Imported exclusively by Expo's development API routes, never by the client.
export async function proxyAdk(request: Request): Promise<Response> {
  const path = new URL(request.url).pathname;
  const allowed = (request.method === 'POST' && (path === '/run' || path === '/auth/google'
    || /^\/apps\/[a-zA-Z0-9_-]+\/users\/[a-zA-Z0-9_-]+\/sessions$/.test(path)))
    || (path === '/auth/session' && ['GET', 'DELETE'].includes(request.method));
  if (!allowed) {
    return new Response(null, { status: 404 });
  }
  const baseUrl = (process.env.ADK_API_URL ?? 'http://127.0.0.1:8000').replace(/\/$/, '');
  try {
    const headers: Record<string, string> = {};
    for (const name of ['content-type', 'cookie', 'origin', 'x-requested-with']) {
      const value = request.headers.get(name);
      if (value) headers[name] = value;
    }
    const response = await fetch(`${baseUrl}${path}`, {
      method: request.method,
      headers,
      ...(request.method === 'POST' ? { body: await request.text() } : {}),
      signal: request.signal,
      redirect: 'error',
    });
    const responseHeaders = new Headers({
      'Content-Type': response.headers.get('Content-Type') ?? 'application/json',
      'Cache-Control': 'no-store',
    });
    for (const cookie of response.headers.getSetCookie()) responseHeaders.append('Set-Cookie', cookie);
    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch {
    return Response.json({ detail: 'Backend ADK indisponible.' }, { status: 502 });
  }
}
