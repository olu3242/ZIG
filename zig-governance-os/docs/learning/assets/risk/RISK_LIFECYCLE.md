# Risk Lifecycle

## Purpose
Teaches the recurring lifecycle every risk moves through from initial identification to
closure, anchoring the Risk track's foundational lesson before risk scoring, treatment,
or monitoring are introduced individually.

## Structure (content spec, not a rendering implementation)

```
Identify -> Assess -> Analyze -> Treat -> Monitor
```

| Stage | What happens |
|---|---|
| Identify | Risk is discovered/logged against an asset or process |
| Assess | Initial likelihood/impact assessment is performed |
| Analyze | Deeper analysis — root cause, contributing factors, score derivation |
| Treat | Treatment option selected and applied (accept/mitigate/transfer/avoid) |
| Monitor | Ongoing tracking of treated risk and re-assessment triggers |

## Used by
- `risk/01_RISK_FOUNDATIONS.md`
- `DIAGRAM_LIBRARY.md` — "Risk Lifecycle" entry

## Reconciliation
`DIAGRAM_LIBRARY.md`'s existing "Risk Lifecycle" entry depicts six steps: "Identify →
Assess → Score → Treat → Monitor → Close." This file's five-step version (Identify →
Assess → Analyze → Treat → Monitor) is **the same named asset**, not a new one, with two
differences to reconcile explicitly:
1. This file's "Analyze" step corresponds to the scoring/root-cause work that the library
   entry compresses into "Score" — same activity, more descriptive label.
2. This file omits the library's terminal "Close" step. That omission is not intentional
   simplification of the lifecycle's meaning — the lifecycle is still cyclical and risks
   are still formally closed; "Close" should be treated as implicit at the end of
   "Monitor" when a risk is fully resolved. Lessons referencing "Risk Lifecycle" should
   use the library's six-step version (`Identify → Assess → Score → Treat → Monitor →
   Close`) as canonical; this file exists to additionally surface "Analyze" as a
   sub-step of "Score" for teaching depth, not to replace the canonical sequence.
