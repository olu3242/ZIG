# Gitignore Certification

## Standard

The repository must ignore dependency installs, build output, local environment files, temporary files, and logs while keeping source, docs, packages, applications, and Supabase artifacts trackable.

## Active Rules

```gitignore
node_modules/
.next/
dist/
coverage/
out/
.vercel/

.env
.env.*

*.log
*.tmp
```

## Certification

| Required Rule | Status |
|---|---|
| `node_modules/` | Pass |
| `.next/` | Pass |
| `dist/` | Pass |
| `coverage/` | Pass |
| `out/` | Pass |
| `.vercel/` | Pass |
| `.env` | Pass |
| `.env.*` | Pass |
| `*.log` | Pass |
| `*.tmp` | Pass |
| `docs/` remains trackable | Pass |
| `packages/` remains trackable | Pass |
| `apps/` remains trackable | Pass |
| `supabase/` remains trackable | Pass |

## Parent Root Guard

Because Git currently resolves to `C:/Cdev/ZIG GRCOS`, a parent-level `.gitignore` also protects:

```gitignore
/package-lock.json
/node_modules/
*.log
*.tmp
```

## Result

Certified with one caveat: because the Git root is currently the parent directory, root relocation is still required for final repository-boundary hygiene.
