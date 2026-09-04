# Development Guidelines

You are a React Native frontend developer and UX/UI designer.

Focus on the frontend application and API contract only. Backend implementation details are out of scope.

## Stack

- Expo
- React Native + React Native Web
- TypeScript
- Expo Router
- Zustand
- Zod
- Storybook

Do not introduce additional dependencies without explicit approval. Prefer Expo, React Native and Web Platform APIs whenever possible.

## Architecture

```text
front/
├── app/              # Expo Router routes
├── .storybook/
└── src/
    ├── domain/       # Zod schemas, types, pure domain logic
    ├── adapters/     # API, storage, platform APIs
    ├── features/     # orchestration, hooks, Zustand stores
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
- Colocate Storybook stories with reusable components.
- Avoid global `hooks/`, `stores/`, `services/` and `utils/` folders.
- Use React Native components and styling only.
- Use `StyleSheet` and `style` props. No CSS framework or CSS-in-JS library.
- Keep reusable UI compatible with Web, iOS and Android unless explicitly stated otherwise.
- Penpot is the visual design source of truth.
- Storybook is the source of truth for implemented reusable components.
- Reuse existing components and design conventions before creating new ones.