// No dependencies required: node --test tests/ui/recipe-ui.test.cjs
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { resolve } = require("node:path");
const vm = require("node:vm");

const html = readFileSync(resolve(__dirname, "../../app/adapters/inbound/web/templates/index.html"), "utf8");
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const response = {
  success: true,
  recipe: {
    recipe: {
      name: "Crispy oven fries",
      description: "Homemade fries with a yogurt sauce.",
      preparation_duration_minutes: 15,
      cooking_duration_minutes: 30,
      servings: 2,
      ingredients: [{ name: "Potatoes", quantity: 500, unit: "g" }],
      steps: [
        { abstract: "Prepare the potatoes", long_description: "Wash and cut into even sticks.", duration: null, timer: false, wait_for_end: false },
        { abstract: "Bake the fries", long_description: "Bake at 200°C until golden.", duration: 30, timer: true, wait_for_end: true },
        { abstract: "Prepare the sauce", long_description: "Mix yogurt and herbs while the fries bake.", duration: 0, timer: false, wait_for_end: false },
      ],
      tips: ["Dry the potatoes thoroughly."],
    },
    nutritionist_quote: "Serve with a protein source.",
    nutritionist_score: 8,
    glut_health_expert_quote: "Add vegetables for variety.",
    glut_health_expert_score: 0,
    food_facts: { energy100: 150, fat100: 4, carb100: 23, prot100: 5, fiber100: 3 },
  },
};

// Minimal DOM double: verifies rendering bindings, not browser layout.
function element() {
  const descendants = new Map();
  const classes = new Set();
  return {
    textContent: "", children: [], value: "", disabled: false,
    classList: {
      add: (name) => classes.add(name),
      remove: (name) => classes.delete(name),
      contains: (name) => classes.has(name),
      toggle: (name, enabled) => enabled ? classes.add(name) : classes.delete(name),
    },
    querySelector(selector) {
      const marker = selector.startsWith("#") ? 'id="' + selector.slice(1) + '"'
        : selector.startsWith("[") ? selector.slice(1, -1) : selector.slice(1);
      assert.ok(html.includes(marker), "Missing HTML binding: " + selector);
      if (!descendants.has(selector)) descendants.set(selector, element());
      return descendants.get(selector);
    },
    addEventListener(name, handler) { this[name] = handler; },
    replaceChildren() { this.children = []; },
    append(child) { this.children.push(child); },
    content: { cloneNode: () => element() },
  };
}
function setup() {
  const document = element();
  document.createElement = () => element();
  const context = vm.createContext({ document, Intl });
  vm.runInContext(script, context);
  return { context, get: (selector) => document.querySelector(selector) };
}

test("renders nested recipe, reviews, tips, macros and detailed steps", () => {
  const { context, get } = setup();
  context.showRecipe(context.parseRecipeResponse(response));
  assert.equal(get("#recipe-name").textContent, "Crispy oven fries");
  assert.equal(get("#recipe-energy").textContent, "150");
  assert.equal(get("#recipe-fiber").textContent, "3");
  assert.equal(get("#gut-health-score").textContent, "0");
  assert.equal(get("#nutritionist-quote").textContent, response.recipe.nutritionist_quote);
  assert.equal(get("#chef-tips").children.length, 1);
  assert.equal(get("#ingredient-list").children.length, 1);
  const steps = get("#step-list").children;
  assert.equal(steps[0].querySelector("[data-step-abstract]").textContent, "Prepare the potatoes");
  assert.equal(steps[1].querySelector("[data-step-description]").textContent, "Bake at 200°C until golden.");
  assert.deepEqual(steps.map((step) => step.querySelector("[data-step-duration]").textContent), ["", "30 min", "0 min"]);
  assert.ok(steps[0].querySelector("[data-step-timer]").classList.contains("hidden"));
  assert.ok(!steps[1].querySelector("[data-step-timer]").classList.contains("hidden"));
  assert.ok(!steps[1].querySelector("[data-step-wait]").classList.contains("hidden"));
});

test("clears stale content and assigns generated text without HTML", () => {
  const { context, get } = setup();
  context.showRecipe(response.recipe);
  const next = structuredClone(response);
  next.recipe.recipe.name = '<img src=x onerror="window.injected=true">';
  next.recipe.recipe.tips = [];
  next.recipe.recipe.steps = [];
  context.showRecipe(next.recipe);
  assert.equal(get("#recipe-name").textContent, next.recipe.recipe.name);
  assert.equal(get("#recipe-name").innerHTML, undefined);
  assert.equal(get("#step-list").children.length, 0);
  assert.equal(get("#chef-tips").children.length, 0);
  assert.ok(get("#chef-tips-section").classList.contains("hidden"));
});

test("extracts final JSON without concatenating intermediate answers or thoughts", () => {
  const { context } = setup();
  const result = context.extractRecipeResponse([
    { content: { parts: [{ text: '{"suggested_recipes":[]}' }] } },
    { output: response.recipe.food_facts },
    { content: { parts: [{ thought: true, text: "private reasoning" }, { text: "```json\n" + JSON.stringify(response) + "\n```" }] } },
    { content: { parts: [] } },
  ]);
  assert.deepEqual(JSON.parse(JSON.stringify(result)), response.recipe);
});

test("supports ADK structured output and response tool calls", () => {
  const { context } = setup();
  for (const event of [
    { output: response },
    { output: JSON.stringify(response) },
    { content: { parts: [{ functionCall: { name: "set_model_response", args: response } }] } },
  ]) {
    assert.deepEqual(JSON.parse(JSON.stringify(context.extractRecipeResponse([event]))), response.recipe);
  }
});

test("preserves final errors instead of using an earlier success", () => {
  const { context, get } = setup();
  assert.throws(() => context.extractRecipeResponse([
    { output: response },
    { output: { success: false, recipe: null, description: "Please ask for a recipe." } },
  ]), /Please ask for a recipe/);
  context.showError(new Error("Please ask for a recipe."));
  assert.equal(get("#error-message").textContent, "Please ask for a recipe.");
  assert.ok(!get("#result-error").classList.contains("hidden"));
  assert.ok(get("#recipe-card").classList.contains("hidden"));
});

test("rejects incomplete final recipes before rendering", () => {
  const { context } = setup();
  for (const path of [
    ["food_facts", "fiber100"], ["recipe", "tips"], ["recipe", "steps", 0, "abstract"],
    ["recipe", "steps", 0, "timer"], ["nutritionist_quote"],
  ]) {
    const invalid = structuredClone(response);
    const parent = path.slice(0, -1).reduce((value, key) => value[key], invalid.recipe);
    delete parent[path.at(-1)];
    assert.throws(() => context.parseRecipeResponse(invalid), /valid recipe/);
  }
});

test("accepts and renders a duration omitted by ADK", () => {
  const { context, get } = setup();
  const payload = structuredClone(response);
  delete payload.recipe.recipe.steps[0].duration;
  const parsed = context.extractRecipeResponse([{ output: payload }]);
  context.showRecipe(parsed);
  assert.equal(get("#step-list").children[0].querySelector("[data-step-duration]").textContent, "");
  assert.equal(get("#step-list").children[1].querySelector("[data-step-duration]").textContent, "30 min");
});

test("rejects an invalid duration even though omission is allowed", () => {
  const { context } = setup();
  const payload = structuredClone(response);
  payload.recipe.recipe.steps[0].duration = "unknown";
  assert.throws(() => context.parseRecipeResponse(payload), /valid recipe/);
});

test("rejects intermediate or partial responses", () => {
  const { context } = setup();
  assert.throws(() => context.extractRecipeResponse([
    { output: response.recipe.food_facts },
    { partial: true, output: response },
  ]), /did not return a final recipe/);
  assert.throws(() => context.extractRecipeResponse({}), /unexpected response format/);
});
