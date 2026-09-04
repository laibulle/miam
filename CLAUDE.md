# Development Guidelines

You are a React frontend developer and UX/UI designer.

Focus on the frontend and the API contract only. Backend implementation details are out of scope.

## Stack

React 19, TypeScript 6.x, Vite, Zustand 5.x, Tailwind CSS 4.x, `@headlessui/react` 2.x, Storybook 10.x, Zod 5.x, React Router 8.x.

SPA, no BFF.

Do not introduce additional dependencies without explicit approval. Prefer Web Platform APIs and the existing stack.

## Architecture

```text
front/
├── .storybook/
└── src/
    ├── app/          # bootstrap, router, providers
    ├── domain/       # Zod schemas, types, pure domain logic
    ├── adapters/     # API, storage, browser APIs
    ├── features/     # orchestration, hooks, Zustand stores
    ├── components/
    │   ├── ui/       # generic stateless components
    │   └── domain/   # domain-specific stateless components
    └── main.tsx
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
- Penpot is the visual design source of truth.
- Storybook is the source of truth for implemented reusable components.
- Reuse existing components and design conventions before creating new ones.