# Zig — AI-Native Governance Operating System

Zig replaces the spreadsheet-and-template approach to GRC with one connected data model
(Organization → Project → Asset → Risk → Control → Framework Requirement → Evidence →
Task → Report), an AI Command Center that generates governance programs directly into
that model, an explainable governance score, and a continuously running Health Advisor.

This repository currently contains the **Documentation OS, methodology, design system,
and landing page** for Zig — the foundation that has to exist before Fable 1
(application code) starts, per the documentation-first rule below.

## Start here

- **`CLAUDE.md`** — the build instructions Claude Code reads automatically. Read this
  first; it's the source of truth for what's been built, what's still a stub, and what
  order things get built in.
- **`.claude/skills/zig-fable5-methodology/SKILL.md`** — the Documentation-OS + Fable-5
  methodology as a reusable skill. Consult it whenever deciding what to build next.
- **`DESIGN.md`** — quick-reference design tokens (full version: `docs/ux/design-system.md`).
- **`docs/`** — the full documentation OS. Run `npm run docs:lint` to see which docs are
  written vs. still stubs.

## What's written vs. still a stub

```
npm run docs:lint
```

prints every doc under `docs/` and flags which ones still carry a `STATUS: STUB` marker.
As of this version: the vision docs, the PRD, personas, user journeys, MVP definition, the
system architecture doc + diagram, the design system, and the roadmap are written. The
remaining ~40 docs (per-module specs, framework catalogs, database schema, sprint plan,
QA plans) are stubs with a checklist of exactly what they need — see `CLAUDE.md`'s status
table for the full picture.

## Repository layout

```
CLAUDE.md                  Claude Code build instructions (read first)
DESIGN.md                  Design system quick reference
README.md                  This file
package.json
scripts/check-docs.js      Reports which docs/ files are still stubs
.claude/skills/            Project-level methodology skill
docs/
  vision/                  Product vision, positioning, success metrics
  product/                 PRD, personas, user journeys, MVP definition, IA
  architecture/            System architecture (+ diagram), AI/framework/scoring/health-advisor engines
  modules/                 One doc per product module (11 total)
  frameworks/              Universal governance model + one doc per supported framework
  data/                    Entities, ERD, schema, relationship model
  ux/                      Design system, navigation, wireframes, empty states, dashboards
  implementation/          Roadmap, sprint plan, per-Fable detail docs
  qa/                      Acceptance criteria, test plan, E2E validation
landing-page/
  index.html               Standalone marketing landing page
```

`apps/web` and `apps/api` (the actual application) don't exist yet — they get built in
Fable 1, once the Fable 1 docs are complete (see `CLAUDE.md`).

## Running the landing page locally

```
npm install
npm run landing
```

opens the static landing page at `http://localhost:4321`. It has no build step — it's a
single self-contained HTML file with inline CSS/JS.

## How to continue this with Claude Code

Open this folder in Claude Code. It will read `CLAUDE.md` automatically. From there, the
natural next step is to ask it to fill in the highest-priority stubs first: the RBAC
permission matrix (`docs/architecture/multi-tenant-architecture.md`), the governance
scoring formula (`docs/architecture/governance-scoring-engine.md`), the database schema
(`docs/data/`), and the information architecture (`docs/product/information-architecture.md`)
— those four block everything else per the open questions section of `docs/product/prd.md`.
