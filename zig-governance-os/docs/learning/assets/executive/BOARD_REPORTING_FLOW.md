# Board Reporting Flow (Detail Spec)

## Purpose
Detail spec showing the organizational reporting chain that carries governance information
upward, as distinct from the content-preparation steps already indexed in
`WORKFLOW_LIBRARY.md`. This is a content spec only — no rendering implementation.

## Structure

```
Operations → Risk Team → Executive Team → Board
```

| Stage | What happens |
|---|---|
| Operations | Raw operational data generated (incidents, control test results, evidence status) |
| Risk Team | Data aggregated, scored, and filtered for board relevance |
| Executive Team | Risk team's output reviewed, prioritized, framed for strategic context |
| Board | Final report presented for oversight and decision-making |

## Used by
- `executive_leadership/05_*`
- Cross-references `WORKFLOW_LIBRARY.md` → "Board Reporting Flow"

## Reconciliation
`WORKFLOW_LIBRARY.md`'s existing "Board Reporting Flow" entry is **Score decomposed →
business-language translation → roadmap built → delivery → Q&A** — this describes the
*content-preparation* steps performed on a report. This detail version instead shows the
*organizational reporting chain* (which roles/teams the information passes through). These
are complementary views of the same artifact, not duplicates: the library entry answers
"what work happens to the content," this entry answers "who hands it to whom." Both are
valid lenses on the same Board Reporting Flow asset.
