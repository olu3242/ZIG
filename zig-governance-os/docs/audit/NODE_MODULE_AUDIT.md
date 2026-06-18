# Node Module Audit

## Finding

`node_modules` is present locally as an installed dependency directory but is not tracked by Git.

## Source Package Boundary

The canonical package source directories are:

```text
packages/*
apps/*
```

Any matching package content under `node_modules/@zig/*` is an npm workspace install/link artifact, not source of truth.

## Cleanup Status

| Item | Status |
|---|---|
| Tracked `node_modules` files | Fixed in commit `08cf3f39` |
| `.gitignore` protects `node_modules/` | Pass |
| Workspace source packages exist outside `node_modules` | Pass |
| Local installed modules present | Acceptable |

## Rule

Never edit package source through `node_modules/@zig/*`. Edit only `packages/*` and let npm workspace linking reflect changes locally.
