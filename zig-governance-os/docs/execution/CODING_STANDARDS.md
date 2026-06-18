# Coding Standards

## TypeScript

- Use strict TypeScript.
- Export typed contracts from packages instead of duplicating local shapes.
- Prefer narrow union types for statuses, roles, actions, and resources.
- Avoid `any`. If unavoidable, document why.
- Keep package APIs small and explicit.
- Do not weaken types to quiet compiler errors.

## Package Boundaries

- Shared domain contracts live in `packages/types`.
- Data access lives in `packages/data-access`.
- Business services live in `packages/services`.
- Framework intelligence lives in `packages/framework-engine`.
- Governance calculations and RBAC live in `packages/governance-engine`.
- UI primitives live in `packages/ui`.

Applications may consume packages, but packages should not import from apps.

## Next.js

- Use App Router.
- Use Server Components by default.
- Use Client Components only for browser state, event handlers, or error boundaries.
- Keep route pages thin; move reusable logic into packages or app-local libraries.
- Never ship a blank state.

## Data Access

- Never query tenant-scoped records without `tenantId`.
- Use repository and service layers for application data access.
- Never bypass RLS in application code.
- Every create/update/delete/approve/review/certify operation must be auditable.

## UI

- Follow `DESIGN.md` and `docs/ux/design-system.md`.
- Use Zig tokens for color and typography.
- Keep dashboards operational and data-dense.
- Do not create marketing pages for app workflows.
- Use reusable UI primitives before adding custom one-off layouts.

## Documentation

- Add or update docs before implementing a new architectural concept.
- Implementation reports must be concise, factual, and traceable.
- Keep roadmap items separate from executable implementation batches.

## Error Handling

- Fail closed on tenant or permission ambiguity.
- Return typed errors from shared packages when practical.
- Avoid swallowing errors silently.
- UI errors must offer a recovery path.

## Comments

Use comments only to explain non-obvious decisions, tenant isolation constraints, security assumptions, or complex domain logic.
