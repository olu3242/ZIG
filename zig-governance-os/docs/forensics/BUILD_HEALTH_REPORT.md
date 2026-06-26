# Build Health Report

Scope: root `package.json` scripts, `npm run typecheck`, `npm run test`, `npx next build`
in `apps/web`, `npx eslint app` in `apps/web`, and the shape of the monorepo's test
infrastructure across all `packages/*/package.json` files. All commands below were
re-run fresh in this session and are reported as actually observed, not assumed.

## Findings

### 1. The repo is npm workspaces, not pnpm, contrary to the task brief's premise (Low, factual correction)
Root `package.json` declares `"workspaces": ["apps/*", "packages/*"]` with scripts
invoked via `npm run ... --workspace`/`--workspaces`. There is no `pnpm-workspace.yaml`
and no `pnpm-lock.yaml` at the repo root — only `package-lock.json`. This audit's
original brief described the repo as a "pnpm workspace monorepo"; that is incorrect for
this codebase as it stands. Not a defect, but worth correcting so future tooling
decisions (CI cache keys, lockfile commits, etc.) target the right package manager.

### 2. `npm run typecheck` passes cleanly (verified this session)
Root `typecheck` script runs `tsc -p tsconfig.json --noEmit` for `@zig/data-access` and
then `@zig/services` only — it does not typecheck `apps/web`, `apps/admin`, or any of the
~100 other `packages/*`. Both of the two packages it does cover produced zero errors when
re-run in this session.

### 3. `npm run test` (root, all workspaces) completes successfully and reveals two different testing strategies (Medium finding, not a failure)
Re-run to completion in this session (it had previously timed out in an earlier pass of
this audit; the fresh run completed with exit code 0). The output shows most packages'
`"test"` script is simply an alias for `"typecheck"` (e.g. `@zig/data-access`,
`@zig/services`, `@zig/telemetry`, `@zig/training-cloud`, `@zig/webhooks`, and dozens of
others all run `npm run typecheck` when `test` is invoked — confirmed via direct
`package.json` reads for `packages/data-access`, `packages/services`). A smaller set of
packages — confirmed: `packages/agents`, `packages/supervisor-agents`, and others in the
`agent-*` family — run real executable test files via `tsx src/tests/*.test.ts` (e.g.
`@zig/supervisor-agents`'s run printed "All governance-supervisor tests passed."). A
repo-wide `find . -name "*.test.ts"` (excluding `node_modules`/`.next`) finds 31 test
files across 12 packages, concentrated in the `agent-*` family
(`agent-domain-intelligence`, `agent-evidence-review`, `agent-execution`,
`agent-governance`, `agent-learning-career`, `agent-registry`, `agent-runtime`,
`agent-trigger-automation`, `agents`, `supervisor-agents`) plus `data-access` and
`services` (whose "test" scripts, despite having a `src/tests` directory presence
elsewhere in the monorepo's conventions, alias to typecheck rather than executing
anything in those directories — meaning `packages/data-access` and `packages/services`,
the two packages most central to the frameworks bug this audit was commissioned around,
have the least real test coverage of any package with a `tests` naming convention).

### 4. `apps/web` builds successfully, all 87 routes compile (verified this session)
`npx next build` inside `apps/web` completed successfully, listing every route from the
87-route enumeration in `ROUTE_HEALTH_REPORT.md` with correct static (○) / dynamic (ƒ)
markers. This confirms the codebase is in a deployable state at the TypeScript/bundler
level despite the runtime and data-model issues documented elsewhere in this audit —
build success says nothing about runtime correctness (the frameworks crash, for example,
only manifests when a real request hits `/frameworks/[id]` with a non-uuid id; it does
not fail the build).

### 5. `npx eslint app` produces zero errors and zero warnings (verified this session, corrected from earlier "inconclusive")
Lint completed with exit code 0 and no output at all, confirming a genuine clean pass
rather than a misconfigured/no-op linter — this corrects an earlier provisional read in
this audit that treated silent lint output as inconclusive.

## Severity Table

| Finding | Severity |
|---|---|
| `packages/data-access` and `packages/services` have no real executable tests (test=typecheck) | Medium |
| Repo is npm, not pnpm, contrary to original task framing | Low (informational) |
| Root `typecheck` script only covers 2 of ~100+ packages | Low |
| Build, full-repo test run, and lint all pass cleanly | None (positive finding) |

## Recommendation

Add real unit tests for `packages/data-access` (especially `SupabaseRestAdapter
.findById`/`request`) and `packages/services` (especially `FrameworkService`,
`BaseService`) — these are the two packages most directly implicated in the frameworks
bug this audit investigated, and they currently have zero executable test coverage despite
having the most production-critical logic in the data layer. Extend the root
`typecheck` script to cover `apps/web` and `apps/admin` directly (today it only checks
`@zig/data-access` and `@zig/services`; `apps/web`'s own type safety is only verified
indirectly via `next build`). Correct any CI/tooling documentation that describes this
repo as pnpm-based.
