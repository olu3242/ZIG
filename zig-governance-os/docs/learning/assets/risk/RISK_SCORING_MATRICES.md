# Risk Scoring Matrices

## Purpose
Teaches how a numeric risk score is derived from Likelihood × Impact, with a worked
example, as the computational basis underlying the heatmap visuals.

## Structure (content spec, not a rendering implementation)

```
Score = Likelihood (1-5) x Impact (1-5)
```

| Likelihood / Impact | 1 (Minimal) | 2 (Minor) | 3 (Moderate) | 4 (Major) | 5 (Severe) |
|---|---|---|---|---|---|
| 1 (Rare) | 1 | 2 | 3 | 4 | 5 |
| 2 (Unlikely) | 2 | 4 | 6 | 8 | 10 |
| 3 (Possible) | 3 | 6 | 9 | 12 | 15 |
| 4 (Likely) | 4 | 8 | 12 | 16 | 20 |
| 5 (Almost Certain) | 5 | 10 | 15 | 20 | 25 |

| Score band | Treatment urgency |
|---|---|
| 1-4 | Low — monitor |
| 5-9 | Moderate — plan treatment |
| 10-14 | High — prioritize treatment |
| 15-25 | Critical — immediate treatment required |

## Worked example
A vendor data breach risk is assessed as Likelihood = 3 (Possible) and Impact = 5
(Severe, due to regulated PII exposure). Score = 3 × 5 = 15 → falls in the Critical band
(15-25) → immediate treatment required, escalated to risk owner and governance
committee per the Risk Treatment workflow.

## Used by
- `risk/03_*`
- `HEATMAP_LIBRARY.md` — "Risk Scoring Matrix" entry
- Lab `RISK_LAB_CREATE_ENTERPRISE_RISK_REGISTER.md`

## Reconciliation
This file is the worked-example/computational detail behind `HEATMAP_LIBRARY.md`'s
"Risk Scoring Matrix" entry, which already describes the 5x5 grid with likelihood/impact
bands mapped to score ranges and treatment urgency. No new asset name is introduced —
this elaborates that same matrix with the explicit multiplication table and a concrete
worked example for teaching purposes.
