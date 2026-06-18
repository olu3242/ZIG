# Branching Strategy

## Branches

| Branch Pattern | Purpose |
|---|---|
| `main` | Protected production-ready branch |
| `develop` | Integration branch for accepted batch work |
| `release/*` | Stabilization branches for release candidates |
| `feature/*` | Scoped implementation work |
| `hotfix/*` | Urgent production corrections |
| `docs/*` | Documentation-only changes |
| `architecture/*` | Architecture and execution-governance changes |

## Rules

- Keep `main` deployable.
- Merge implementation batches through reviewed pull requests once remote hosting is active.
- Do not mix roadmap expansion with implementation code in the same branch.
- Every batch branch must include an implementation report.
