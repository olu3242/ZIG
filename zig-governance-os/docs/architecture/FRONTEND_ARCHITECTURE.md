# Frontend Architecture

The vertical slice uses Next.js App Router in `apps/web` with Server Components by default and Server Actions for mutations.

## Integrated Routes

| Route | Purpose | Data Source |
|---|---|---|
| `/signup` | Supabase email signup | Supabase Auth REST |
| `/login` | Supabase password login | Supabase Auth REST |
| `/forgot-password` | Supabase password recovery | Supabase Auth REST |
| `/onboarding` | Tenant and first user provisioning | `@zig/services` |
| `/dashboard` | Tenant operating dashboard | `@zig/services` |
| `/projects` | Project list | `ProjectService` |
| `/projects/new` | Project creation | `ProjectService`, `FrameworkService` |
| `/projects/[id]` | Project detail | `ProjectService` |
| `/frameworks` | Tenant framework registry | `FrameworkService` |
| `/frameworks/[id]` | Framework detail | `FrameworkService` |

## State Model

Server-side cookies store the Supabase session payload, active tenant id, active user profile id, and persona. Server components call route guards before loading tenant-scoped data.

## UI Foundation

Shared UI components in `packages/ui` provide page headers, stats, data tables, fields, select controls, status badges, dialogs, and governance score widgets.

## Mutation Model

Server Actions in `apps/web/app/lib/actions.ts` call Supabase Auth and `@zig/services`. Mutations do not use local mock data.
