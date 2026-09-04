/** @jest-environment node */
import { POST as runProxy } from '../app/run+api';
import { POST as sessionProxy } from '../app/apps/[appName]/users/[userId]/sessions+api';
import { POST as googleProxy } from '../app/auth/google+api';
import { GET as authSessionProxy } from '../app/auth/session+api';

describe('ADK development proxy', () => {
  const originalFetch = global.fetch;
  const originalUrl = process.env.ADK_API_URL;

  beforeEach(() => { process.env.ADK_API_URL = 'http://127.0.0.1:8000'; });
  afterEach(() => {
    global.fetch = originalFetch;
    if (originalUrl === undefined) delete process.env.ADK_API_URL;
    else process.env.ADK_API_URL = originalUrl;
  });

  it.each([
    ['/run', runProxy, '{"app_name":"app","session_id":"s"}', '[{"author":"editor_agent"}]'],
    ['/apps/app/users/web-test/sessions', sessionProxy, '{}', '{"id":"s"}'],
  ] as const)('forwards %s without changing the ADK protocol', async (path, handler, body, result) => {
    const request = new Request(`http://localhost:8081${path}`, { method: 'POST', body, headers: { 'Content-Type': 'application/json' } });
    const mock = jest.fn().mockResolvedValue(new Response(result, { headers: { 'Content-Type': 'application/json' } }));
    global.fetch = mock;
    const response = await handler(request);
    expect(mock).toHaveBeenCalledTimes(1);
    expect(mock).toHaveBeenCalledWith(`http://127.0.0.1:8000${path}`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body, signal: request.signal, redirect: 'error',
    });
    expect(response.status).toBe(200);
    expect(await response.text()).toBe(result);
  });

  it('forwards Google sign-in cookies and the original CSRF headers', async () => {
    global.fetch = jest.fn().mockResolvedValue(new Response(null, { status: 204, headers: {
      'Set-Cookie': 'miam_session=test; HttpOnly; Path=/; SameSite=Lax',
    } }));
    const response = await googleProxy(new Request('http://localhost:8081/auth/google', {
      method: 'POST', body: '{"credential":"test"}', headers: {
        Origin: 'http://localhost:8081', 'X-Requested-With': 'Miam',
        Cookie: 'miam_session=old', 'Content-Type': 'application/json',
      },
    }));
    expect(response.status).toBe(204);
    expect(response.headers.get('set-cookie')).toContain('HttpOnly');
    expect(fetch).toHaveBeenCalledWith('http://127.0.0.1:8000/auth/google', expect.objectContaining({
      headers: { origin: 'http://localhost:8081', 'x-requested-with': 'Miam', cookie: 'miam_session=old', 'content-type': 'application/json' },
    }));
  });

  it('forwards session reads without adding a body or fabricating an origin', async () => {
    global.fetch = jest.fn().mockResolvedValue(new Response('{}'));
    await authSessionProxy(new Request('http://localhost:8081/auth/session', { headers: { Cookie: 'miam_session=test' } }));
    expect(fetch).toHaveBeenCalledWith('http://127.0.0.1:8000/auth/session', expect.objectContaining({
      method: 'GET', headers: { cookie: 'miam_session=test' },
    }));
    expect((fetch as jest.Mock).mock.calls[0][1]).not.toHaveProperty('body');
  });

  it('preserves upstream HTTP errors', async () => {
    global.fetch = jest.fn().mockResolvedValue(new Response('{"detail":"Invalid request"}', { status: 422 }));
    const response = await runProxy(new Request('http://localhost:8081/run', { method: 'POST', body: '{}' }));
    expect(response.status).toBe(422);
    expect(await response.json()).toEqual({ detail: 'Invalid request' });
  });

  it('rejects forwarding other paths', async () => {
    const mock = jest.fn();
    global.fetch = mock;
    const response = await runProxy(new Request('http://localhost:8081/list-apps', { method: 'POST' }));
    expect(response.status).toBe(404);
    expect(mock).not.toHaveBeenCalled();
  });

  it('reports an unavailable ADK server without internal details', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('private failure details'));
    const response = await runProxy(new Request('http://localhost:8081/run', { method: 'POST', body: '{}' }));
    expect(response.status).toBe(502);
    expect(await response.text()).not.toContain('private failure details');
  });
});
