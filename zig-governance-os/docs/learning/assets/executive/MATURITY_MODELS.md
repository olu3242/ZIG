# Maturity Models (Detail Spec)

## Purpose
New asset describing a five-level governance maturity model used to communicate program
maturity to executives in consistent, comparable terms. This is a content spec only — no
rendering implementation.

## Structure

```
1. Ad Hoc → 2. Defined → 3. Managed → 4. Measured → 5. Optimized
```

| Level | Characteristics |
|---|---|
| 1. Ad Hoc | No formal process; governance activity is reactive and undocumented |
| 2. Defined | Policies and processes documented but inconsistently followed |
| 3. Managed | Processes consistently followed, owned, and tracked |
| 4. Measured | Performance measured against KPIs; gaps identified proactively |
| 5. Optimized | Continuous improvement; governance program adapts ahead of risk/regulatory change |

A program's current level (and its target level) is plotted across each module — e.g.
"Vendor Risk: Level 2, target Level 4" — so executives see maturity gaps per domain, not
just one aggregate number.

## Used by
- `executive_leadership/03_*` (proposed — see follow-up note below)

## Reconciliation
This is a **new asset**, not currently indexed in any library doc. It is distinct from the
"Governance Dashboard" diagram (score trend + risks + coverage) — the maturity model is a
qualitative communication tool, not a score. Should be added to `TABLE_LIBRARY.md` or a
new dedicated library as a follow-up; this file does not edit any existing library doc.
