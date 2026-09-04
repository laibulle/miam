import { generateRecipe, RecipesApiError } from './recipesApi';
import type { PromptInput } from '../domain/recipe';

const input: PromptInput = {
  prompt: 'Un plat healthy avec des frites et une sauce',
  activity_level: 3,
  age: 30,
  gender: 'female',
  height_cm: 170,
  weight_kg: 70,
  sports: ['Course à pied'],
  country: 'France',
  month: 9,
};

const validResponse = {
  success: true,
  recipe: {
    recipe: {
      name: 'Frites de patate douce au four',
      preparation_duration_minutes: 15,
      cooking_duration_minutes: 35,
      description: 'Une version plus légère.',
      servings: 2,
      ingredients: [{ name: 'Patate douce', quantity: 600, unit: 'g' }],
      steps: [
        { abstract: 'Préparer', long_description: 'Laver et couper.', duration: null, timer: false, wait_for_end: true },
      ],
      tips: ['Ne pas éplucher.'],
    },
    nutritionist_quote: 'Bon équilibre.',
    nutritionist_score: 8,
    glut_health_expert_quote: 'Probiotiques bienvenus.',
    glut_health_expert_score: 7,
    food_facts: { energy100: 312, fat100: 12, carb100: 42, prot100: 9, fiber100: 4 },
  },
};

function event(payload: unknown, extra = {}) {
  return { author: 'editor_agent', content: { parts: [{ text: JSON.stringify(payload) }] }, ...extra };
}

function mockAdk(events: unknown = [event(validResponse)], session: unknown = { id: 'session-123' }) {
  const mock = jest.fn()
    .mockResolvedValueOnce({ ok: true, json: async () => session })
    .mockResolvedValueOnce({ ok: true, json: async () => events });
  global.fetch = mock as unknown as typeof fetch;
  return mock;
}

describe('generateRecipe', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('creates an ADK session then calls /run with the matching identifiers', async () => {
    const mock = mockAdk();
    const signal = new AbortController().signal;
    const result = await generateRecipe(input, signal);
    const [sessionUrl, sessionOptions] = mock.mock.calls[0];
    const userId = sessionUrl.match(/^\/apps\/app\/users\/(web-[a-z0-9-]+)\/sessions$/)?.[1];
    expect(userId).toBeTruthy();
    expect(sessionOptions).toEqual({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}', signal });
    expect(mock.mock.calls[1][0]).toBe('/run');
    expect(JSON.parse(mock.mock.calls[1][1].body)).toEqual({
      app_name: 'app', user_id: userId, session_id: 'session-123',
      new_message: { role: 'user', parts: [{ text: JSON.stringify(input) }] },
    });
    expect(mock.mock.calls[1][1].signal).toBe(signal);
    expect(mock).toHaveBeenCalledTimes(2);
    expect(result.recipe?.recipe.name).toBe(validResponse.recipe.recipe.name);
  });

  it('ignores other agents, partial events and thoughts', async () => {
    const final = event(validResponse);
    final.content.parts.unshift({ text: 'private reasoning', thought: true } as typeof final.content.parts[number]);
    mockAdk([
      { author: 'chief_agent', content: { parts: [{ text: 'intermediate' }] } },
      final,
      event({ success: true }, { partial: true }),
    ]);
    const result = await generateRecipe(input);
    expect(result).toEqual(validResponse);
    expect(JSON.stringify(result)).not.toContain('private reasoning');
  });

  it('preserves the last editor failure instead of an earlier success', async () => {
    const failure = { success: false, description: 'Précise ta demande.' };
    mockAdk([event(validResponse), event(failure)]);
    await expect(generateRecipe(input)).resolves.toEqual(failure);
  });

  it('accepts optional durations omitted by ADK', async () => {
    const payload = JSON.parse(JSON.stringify(validResponse));
    delete payload.recipe.recipe.steps[0].duration;
    mockAdk([event(payload)]);
    expect((await generateRecipe(input)).recipe?.recipe.steps[0].duration).toBeNull();
  });

  it.each([{}, { id: '' }, { id: null }])('stops on invalid session %j', async session => {
    const mock = mockAdk([], session);
    await expect(generateRecipe(input)).rejects.toBeInstanceOf(RecipesApiError);
    expect(mock).toHaveBeenCalledTimes(1);
  });

  it.each([
    [], {}, [{ author: 'chief_agent' }],
    [event(validResponse, { partial: true })],
    [event(validResponse), event({ success: true })],
    [event({ success: false })],
    [{ author: 'editor_agent', content: null }],
    [{ author: 'editor_agent', content: { parts: [{ text: 'not json' }] } }],
  ])('rejects missing or malformed final responses %j', async events => {
    mockAdk(events);
    await expect(generateRecipe(input)).rejects.toBeInstanceOf(RecipesApiError);
  });

  it.each([0, 1])('handles an HTTP failure at ADK stage %i', async stage => {
    const mock = jest.fn();
    if (stage) mock.mockResolvedValueOnce({ ok: true, json: async () => ({ id: 's' }) });
    mock.mockResolvedValueOnce({ ok: false });
    global.fetch = mock as unknown as typeof fetch;
    await expect(generateRecipe(input)).rejects.toBeInstanceOf(RecipesApiError);
    expect(mock).toHaveBeenCalledTimes(stage + 1);
  });

  it.each([0, 1])('handles a network failure at ADK stage %i', async stage => {
    const mock = jest.fn();
    if (stage) mock.mockResolvedValueOnce({ ok: true, json: async () => ({ id: 's' }) });
    mock.mockRejectedValueOnce(new Error('network down'));
    global.fetch = mock as unknown as typeof fetch;
    await expect(generateRecipe(input)).rejects.toBeInstanceOf(RecipesApiError);
  });

  it('handles invalid JSON from ADK', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => { throw new SyntaxError('invalid JSON'); } });
    await expect(generateRecipe(input)).rejects.toBeInstanceOf(RecipesApiError);
  });

  it('does not send a request when already aborted', async () => {
    const mock = mockAdk();
    const controller = new AbortController();
    controller.abort();
    await expect(generateRecipe(input, controller.signal)).rejects.toMatchObject({ name: 'AbortError' });
    expect(mock).not.toHaveBeenCalled();
  });

  it('does not start /run when aborted after session creation', async () => {
    const controller = new AbortController();
    const mock = jest.fn().mockResolvedValue({ ok: true, json: async () => {
      controller.abort();
      return { id: 'session-123' };
    } });
    global.fetch = mock;
    await expect(generateRecipe(input, controller.signal)).rejects.toMatchObject({ name: 'AbortError' });
    expect(mock).toHaveBeenCalledTimes(1);
  });
});
