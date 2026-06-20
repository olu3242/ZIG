# Visual Learning Standard

## Why this exists
Zig's learning content must not become "another LMS full of PDFs." Every lesson is a
candidate for rendering as an interactive screen in the Zig UI, not a wall of text. This
doc sets the standard every lesson, lab, and scenario doc is now audited against, and the
8 library docs below are the indexed inventory of every visual asset that standard
requires.

## The 70/20/10 rule
Every lesson should target:

| Mode | Share | What this means |
|---|---|---|
| Visual | 70% | Diagrams, workflows, tables, matrices, heatmaps, org charts, decision trees — the
primary way a concept is taught |
| Interactive | 20% | Knowledge checks, scenario exercises, artifact-building tasks the learner
actively does |
| Text | 10% | Narrative business context and explanation — supports the visual, never
replaces it |

A lesson that is mostly paragraphs with one diagram bolted on does not meet this standard,
even if every required section is technically present.

## Required sections on every lesson (in addition to the existing `LESSON_TEMPLATE.md`
structure)
Every lesson file must define, explicitly and by name:

- **Required Diagram** — pulled from `DIAGRAM_LIBRARY.md`
- **Required Workflow** — pulled from `WORKFLOW_LIBRARY.md`
- **Required Table** — pulled from `TABLE_LIBRARY.md`, `FRAMEWORK_MAP_LIBRARY.md`, or
  `HEATMAP_LIBRARY.md` as relevant
- **Required Visual Exercise** — an interactive task the learner performs using the
  required diagram/table/workflow (not a passive read)
- **Required Artifact** — unchanged from the existing "Artifact Produced" section, mapped
  to `docs/artifacts/`

These replace/extend the existing "Diagram Requirements" and "Visual Assets Required"
sections in `LESSON_TEMPLATE.md` with named, library-indexed assets rather than free-text
descriptions.

## How the 8 library docs relate
| Library | Contains |
|---|---|
| `DIAGRAM_LIBRARY.md` | Lifecycle diagrams, flow diagrams, architecture diagrams |
| `WORKFLOW_LIBRARY.md` | Step-sequence workflows (process, escalation, recovery) |
| `TABLE_LIBRARY.md` | Structured comparison/reference tables not covered by the more
specific libraries below |
| `FRAMEWORK_MAP_LIBRARY.md` | Cross-framework crosswalk tables (ISO/SOC2/NIST/etc.) |
| `ORG_CHART_LIBRARY.md` | Committee structures, RACI charts, reporting lines |
| `HEATMAP_LIBRARY.md` | Risk/control heatmaps and scoring matrices |
| `DECISION_TREE_LIBRARY.md` | Branching decision logic (escalation paths, treatment
decisions) |

Every asset named in a lesson's "Required Diagram/Workflow/Table" section must exist as an
entry in exactly one of these libraries — no lesson invents a one-off asset outside the
indexed inventory, so the eventual UI rendering work has a finite, reusable set to build
against rather than 40 bespoke diagrams.

## Backing data
This is a documentation and content-design standard, not a schema change. No new tables
are created. Rendering these assets in the Zig UI is a separate, not-yet-scheduled
implementation wave — explicitly out of scope here, per "never implement before
documenting."

## What this wave does NOT do
- Does not render any diagram, chart, or visual asset.
- Does not add a body/diagram field to `LearningModule` or any other type.
- Does not change scoring, rubrics, or assessment content — only how concepts are taught.
