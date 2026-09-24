# TaskFlow

TaskFlow is a responsive personal task manager for capturing, organizing, and completing everyday tasks.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/taskflow/src/App.tsx` — TaskFlow UI, task state, filtering, editing, and localStorage persistence
- `artifacts/taskflow/src/index.css` — responsive layout, light/dark theme tokens, and component styling
- `artifacts/taskflow/vite.config.ts` — Vite app configuration and artifact routing

## Architecture decisions

- Task data and theme preference are stored in browser localStorage so the app works without a backend.
- The starter task set is used only when no saved task list exists; later refreshes preserve the user's list.
- Sidebar navigation and content filters share the same task view state while keeping Home distinct from All Tasks.

## Product

- Add tasks from the composer or by pressing Enter.
- Complete, uncomplete, edit, and delete tasks.
- Filter by all, active, or completed tasks and clear completed tasks in one action.
- See remaining active-task count and completion progress.
- Toggle between light and dark mode, with both tasks and theme surviving refreshes.

## User preferences

- The interface should stay close to the provided TaskFlow reference: bright blue navigation, rounded cards, light-blue accents, and a navy dark mode.

## Gotchas

- Artifact workflows provide the required `PORT` and `BASE_PATH`; run the app through the managed `artifacts/taskflow: web` workflow.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
