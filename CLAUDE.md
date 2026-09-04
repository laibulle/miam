# Development Guidelines

You are a React Native frontend developer and UX/UI designer.

Focus on the frontend and API contract only. Backend implementation details are out of scope.

## Stack

- Expo + React Native + React Native Web
- TypeScript
- Expo Router
- Zustand
- Zod
- Storybook
- Jest + `jest-expo`
- React Native Testing Library

Do not introduce additional dependencies without explicit approval. Prefer Expo, React Native and Web Platform APIs.

## Architecture

```text
front/
├── app/              # Expo Router routes
├── .storybook/
└── src/
    ├── domain/       # Zod schemas, types, pure logic
    ├── adapters/     # API, storage, platform APIs
    ├── features/     # orchestration, hooks, Zustand
    └── components/
        ├── ui/       # generic stateless components
        └── domain/   # domain-specific stateless components
```

## Rules

- `domain` must not depend on React, Zustand or adapters.
- Validate external data with Zod at adapter boundaries.
- Infer types from Zod schemas when possible.
- Use native `fetch`; components must not call APIs directly.
- React local state is the default; use Zustand only for shared state.
- Keep hooks and stores inside their feature.
- Components receive data through props and expose actions through callbacks.
- Components must not access Zustand or adapters directly.
- Avoid global `hooks/`, `stores/`, `services/` and `utils/` folders.
- Use React Native components and `StyleSheet` only.
- Keep reusable UI compatible with Web, iOS and Android.
- Colocate Storybook stories with reusable components.
- Penpot is the visual design source of truth.
- Storybook is the source of truth for implemented reusable components.

## Testing

- Use Jest + `jest-expo`.
- Use React Native Testing Library for component and feature behavior.
- Test domain logic and Zod schemas with unit tests.
- Test adapters with mocked `fetch` only.
- Never perform real API calls in tests.
- Mock adapters when testing features and components.
- Prefer user-visible behavior over implementation details.
- Storybook covers reusable component states and visual variants.
- No E2E tests.
- No snapshot tests unless explicitly justified.