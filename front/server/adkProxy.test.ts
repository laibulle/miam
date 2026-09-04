/** @jest-environment node */
import { POST as runProxy } from '../app/run+api';
import { POST as sessionProxy } from '../app/apps/[appName]/users/[userId]/sessions+api';

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
    const request = new Request(`http://localhost:8081${path}`, { method: 'POST', body });
    const mock = jest.fn().mockResolvedValue(new Response(result, { headers: { 'Content-Type': 'application/json' } }));
    global.fetch = mock;
    const response = await handler(request);
    expect(mock).toHaveBeenCalledTimes(1);
    expect(mock).toHaveBeenCalledWith(`http://127.0.0.1:8000${path}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body, signal: request.signal, redirect: 'error',
    });
    expect(response.status).toBe(200);
    expect(await response.text()).toBe(result);
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
