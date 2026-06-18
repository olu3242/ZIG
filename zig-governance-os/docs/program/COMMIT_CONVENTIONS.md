# Commit Conventions

## Format

```text
type: concise imperative summary
```

## Types

| Type | Use |
|---|---|
| `feat:` | New product behavior |
| `fix:` | Bug fix or broken behavior correction |
| `refactor:` | Internal code change without behavior change |
| `docs:` | Documentation-only change |
| `test:` | Test-only or test infrastructure change |
| `build:` | Build, dependency, package, or CI change |
| `chore:` | Repository maintenance and housekeeping |

## Rules

- Keep commits batch-scoped.
- Do not combine unrelated source-control cleanup with business features.
- Mention the batch or phase when useful.
- Implementation commits must leave the system deployable.
