# Package Certification

## Package Health

| Package | Score | Certification |
|---|---:|---|
| `@zig/types` | 85% | Foundational contracts exist; add typecheck script |
| `@zig/ui` | 82% | UI exports exist; add package-level typecheck/build script |
| `@zig/data-access` | 92% | Typecheck script exists; ready for Batch 21B hardening |
| `@zig/services` | 90% | Typecheck script exists; ready for Batch 21B hardening |
| `@zig/framework-engine` | 80% | Registry exists; add script/test coverage |
| `@zig/governance-engine` | 80% | Score engine exists; add script/test coverage |
| `ai-engine` | 35% | Placeholder directory; manifest missing |
| `evidence-engine` | 35% | Placeholder directory; manifest missing |
| `learning-engine` | 35% | Placeholder directory; manifest missing |
| `scenario-engine` | 35% | Placeholder directory; manifest missing |

## Required Standard

Every package should have:

- `package.json`
- `src/index.ts` or `src/index.tsx`
- explicit exports or `main`/`types`
- `tsconfig.json`
- `typecheck` script
- tests when business logic is introduced

## Recommendations

Normalize package scripts during Batch 21B without introducing future business functionality.
