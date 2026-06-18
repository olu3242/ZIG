# Lockfile Strategy

## Decision

Zig uses one npm workspace lockfile at the product root:

```text
zig-governance-os/package-lock.json
```

Application-level and package-level lockfiles are not allowed.

## Rationale

- Keeps dependency resolution deterministic across all npm workspaces.
- Prevents app/package dependency drift.
- Supports a single CI install path from the product root.
- Simplifies security scanning and dependency review.

## Audit Result

| Location | Status | Action |
|---|---|---|
| `zig-governance-os/package-lock.json` | Keep | Canonical workspace lockfile |
| `C:/Cdev/ZIG GRCOS/package-lock.json` | Removed | Duplicate untracked parent lockfile |
| `apps/*/package-lock.json` | Not found | No action |
| `packages/*/package-lock.json` | Not found | No action |

## Policy

Run dependency commands from `zig-governance-os/` unless a tool explicitly requires otherwise. Do not commit lockfiles inside `apps/` or `packages/`.
