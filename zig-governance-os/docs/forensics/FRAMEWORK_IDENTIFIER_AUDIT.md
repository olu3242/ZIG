# Framework Identifier Audit

Scope: `packages/framework-engine`, `packages/services/src/FrameworkService.ts` +
`BaseService.ts`, `packages/data-access` (`TenantRepository`, `SupabaseRestAdapter`,
`records.ts`, `repositories.ts`), `apps/web/app/frameworks/**`, `apps/web/app/lib/data.ts`,
`apps/web/app/lib/lifecycle.ts`, and the two competing `frameworks` table definitions in
`supabase/migrations/`.

> Note: the task brief references a pre-existing root-cause document
> `FRAMEWORK_LIBRARY_ROOT_CAUSE.md` at the repo root. That file does **not exist** on this
> branch (`audit/platform-integrity-batch-1`, fresh from `origin/main` — confirmed by
> `find . -maxdepth 1 -iname "*FRAMEWORK_LIBRARY*"` returning nothing, and a full listing of
> root `*.md` files). This audit re-derives the same bug independently from source, with
> stronger evidence than a one-line description could give: there are not one but **two**
> conflicting `frameworks` table schemas in the migration history simultaneously.

## Identifier classification

| Location | Identifier | Class | Evidence |
|---|---|---|---|
| `packages/framework-engine/src/FrameworkRegistry.ts:16-57` | `id: "framework_iso27001_2022"` etc. | **SLUG** (human-readable static string, not a DB key) | `FRAMEWORK_REGISTRY` literal object |
| `packages/framework-engine/src/FrameworkRegistry.ts:3-9` | `"ISO27001" \| "NIST_CSF" \| ...` | **CODE** (`FrameworkCode` union type) | type definition |
| `packages/framework-engine/src/FrameworkRegistry.ts:69-71` | `findById(id: string)` | looks up by the SLUG field above, **not** a UUID | `.find((framework) => framework.id === id)` |
| `supabase/migrations/202606180001_batch_21_core_data_platform.sql:106-116` | `frameworks.id uuid primary key default gen_random_uuid()` | **UUID** | `create table frameworks (id uuid primary key ...)` |
| `supabase/migrations/202606200003_governance_lifecycle_create.sql:4-12` | `public.frameworks.framework_id text primary key` | **CODE-as-PK** (text, e.g. `'iso27001'`) | `create table if not exists public.frameworks (framework_id text primary key, ...)` |
| `supabase/migrations/202606200003_governance_lifecycle_create.sql:71-78` | seed rows `'iso27001'`, `'soc2'`, `'nist_csf'`, ... | **CODE** (lowercase, snake-ish) | `insert into public.frameworks (framework_id, code, name, ...) values ('iso27001', 'ISO27001', ...)` |
| `packages/data-access/src/records.ts:30` | `FrameworkRecord = Framework & { tenantId, createdAt, updatedAt }` | inherits `Framework.id` from `@zig/types`, typed as generic `string`, but the repository wiring assumes **UUID** semantics (see below) | type alias |
| `packages/data-access/src/repositories.ts:64,93` | `new TenantRepository("frameworks", new SupabaseRestAdapter<FrameworkRecord>(config), ...)` | repository targets the **uuid-keyed** `frameworks` table from migration `202606180001`, addressed via PostgREST `id=eq.<value>` | `SupabaseRestAdapter.findById` builds `id=eq.<id>` filter (`SupabaseRestAdapter.ts:60-63,103-127`) |
| `apps/web/app/frameworks/[id]/page.tsx:9` | `getZigServices().frameworks.findById(context, id)` | passes the **route param** straight through — the route param's actual value depends entirely on which list page linked to it | `await getZigServices().frameworks.findById(context, id)` |
| `apps/web/app/frameworks/page.tsx:18` | `href={'/frameworks/' + framework.id}` | links use whatever `framework.id` the **list loader** produced | `Link ... href={'/frameworks/' + framework.id}` |
| `apps/web/app/lib/data.ts:81-97` (`loadFrameworks`) | `id: framework.frameworkId` (from `listLifecycleFrameworks()`, which reads `public.frameworks.framework_id`, e.g. `"iso27001"`) | **CODE** (text PK from the second migration's table) | `frameworks.map((framework) => ({ id: framework.frameworkId, ... }))` |
| `apps/web/app/lib/data.ts:108-119` (`fallbackFrameworks`) | `id: framework.code.toLowerCase()` | **derived SLUG/CODE**, e.g. `"iso27001"` from `FrameworkRegistry` codes | `id: framework.code.toLowerCase()` |
| `apps/web/app/lib/lifecycle.ts:77-82` (`RestFrameworkRow`) | `framework_id: string` | maps the **text PK** table, confirming `loadFrameworks()`'s source table is `public.frameworks` (text PK), not the uuid table | interface field |

## The bug, confirmed independently

1. `apps/web/app/frameworks/page.tsx` renders links using identifiers that are always
   **CODE-shaped text** (`"iso27001"`, `"soc2"`, ...) — sourced either from
   `listLifecycleFrameworks()` (which reads `public.frameworks.framework_id`, a `text`
   primary key) or from `fallbackFrameworks()` (`FrameworkRegistry` codes, lowercased).
2. `apps/web/app/frameworks/[id]/page.tsx` takes that same text value and calls
   `getZigServices().frameworks.findById(context, id)`.
3. `FrameworkService` (`packages/services/src/FrameworkService.ts`) inherits `findById`
   unmodified from `BaseService` (`packages/services/src/BaseService.ts:18-20`), which
   delegates to `TenantRepository.findById` -> `SupabaseRestAdapter.findById`
   (`SupabaseRestAdapter.ts:60-63`), which issues
   `GET /rest/v1/frameworks?id=eq.iso27001&tenant_id=eq.<tenant>`.
4. The repository wiring in `repositories.ts:64` points the `frameworks` repository at the
   table from migration `202606180001`, whose `id` column is `uuid`. PostgREST/Postgres
   rejects `eq.iso27001` against a `uuid` column with a 400 (`invalid input syntax for type
   uuid`).
5. `SupabaseRestAdapter.request` (`SupabaseRestAdapter.ts:80-101`) throws a
   `DataAccessError` on any non-OK response — there is **no try/catch** in
   `frameworks/[id]/page.tsx` around the `findById` call, unlike `projects/[id]/page.tsx`
   which checks `if (!workspace) notFound()` after a *tolerant* lookup
   (`getLifecycleProject`, which itself wraps REST calls and returns `null` rather than
   throwing — see `ROUTE_HEALTH_REPORT.md`).
6. The uncaught error propagates to the nearest boundary, `apps/web/app/frameworks/error.tsx`,
   which renders the literal heading "Framework library needs a refresh" — this exact string
   exists in the codebase today (`error.tsx:6`), corroborating that this is a live, reachable
   failure mode and not a hypothetical.

## Why this is structural, not a one-off typo

There are **two independently-evolved `frameworks` tables** in the migration history:

- `202606180001_batch_21_core_data_platform.sql` -- `frameworks.id uuid`, tenant-scoped,
  designed for the `@zig/data-access` / `@zig/services` REST repository layer.
- `202606200003_governance_lifecycle_create.sql` -- `public.frameworks.framework_id text`,
  designed for the hand-rolled REST calls in `apps/web/app/lib/lifecycle.ts`.

Both tables are named `frameworks` (the second is schema-qualified `public.frameworks`,
which in Postgres is the same object unless `search_path` differs -- they likely collide or
one silently shadows the other depending on migration order, which is itself a Critical
finding for `DATA_MODEL_DRIFT_REPORT.md`). The web app uses **both** identifier styles
depending on *which loader rendered the link*, while the single `[id]` detail route only
knows how to satisfy one of them. This is the textbook "two services disagree on identifier
shape" pattern the audit was commissioned to find, and it is the root cause of the
`/frameworks/[id]` crash.

## No other framework-aware learning surfaces use real framework IDs

`apps/web/app/learning/lesson/[id]/page.tsx:19` and
`apps/web/app/labs/session/[id]/page.tsx:33` display a `framework` field, but it is sourced
from `@/app/lib/mvp-data` static fixtures (`lesson.framework`, a free-text string like
`"ISO 27001"`), never from `FrameworkRegistry` or the `frameworks` table. There is currently
no cross-reference between the Learning OS content and the Framework Engine identifiers --
they are entirely decoupled, which avoids the crash class described above for learning
routes, but also means "framework-aware" claims in `CLAUDE.md` ("Frameworks ... are
metadata ... Assets, risks, controls, evidence, tasks, and reports must all be
framework-aware") are not actually wired through for the learning surfaces.

## Recommended canonical framework identity model

1. **Pick one `frameworks` table** and drop the other. Recommend keeping the
   `202606180001` UUID-keyed, tenant-scoped table since it is the one the typed
   `@zig/data-access` repository layer and `FrameworkService` already target, and the one
   that supports proper foreign keys from `controls`, `projects`, etc.
2. **Always expose a stable `code` field** (`ISO27001`, `SOC2`, ...) for routing and human
   display, decoupled from the storage primary key. Use `code` in URLs
   (`/frameworks/iso27001`) and resolve via `findByCode` (a new repository method using
   `eq.` filtering on `code`), not `findById` with a UUID-shaped repository.
3. **Make `FrameworkRegistry.id` match the real table's PK type**, or better, stop using
   `id` on `RegisteredFramework` at all for routing purposes -- use `code` exclusively
   for navigation/links and reserve `id` for the UUID once a record is actually persisted.
4. **Add a tolerant lookup path** in `frameworks/[id]/page.tsx` mirroring
   `projects/[id]/page.tsx`'s `getLifecycleProject` pattern: catch `DataAccessError`,
   attempt a fallback `findByCode`, and call `notFound()` rather than letting a 400 escape
   into `error.tsx`.
5. **Reconcile `loadFrameworks()` / `fallbackFrameworks()` / `FrameworkService`** so all
   three produce identifiers of the same class. Today they independently decide between
   `framework.frameworkId` (text PK from the second table), `framework.code.toLowerCase()`
   (derived slug), and (unreachably, in practice) a real UUID from the first table.

Severity: **Critical** (confirmed live crash path, user-facing, in a marquee MVP surface
named directly in `CLAUDE.md`'s required module list).
