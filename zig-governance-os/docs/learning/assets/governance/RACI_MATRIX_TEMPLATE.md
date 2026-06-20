# RACI Matrix Template (Governance Function View)

## Purpose
Teaches a function-oriented view of accountability — which governance function (Board,
Executive, Risk, Compliance, Security) is Responsible, Accountable, Consulted, or
Informed for representative governance activities. This complements the role-generic
RACI Chart already indexed in `TABLE_LIBRARY.md` by showing the same RACI concept applied
specifically to cross-functional governance activities.

## Structure (content spec, not a rendering implementation)

| Activity | Board | Executive | Risk | Compliance | Security |
|---|---|---|---|---|---|
| Set risk appetite | A | R | R | C | I |
| Approve governance policy | A | R | C | R | C |
| Conduct risk assessment | I | C | R/A | C | C |
| Review framework compliance gaps | I | A | C | R | C |
| Approve security control exceptions | I | A | C | C | R |
| Review governance program maturity | A | R | C | C | C |

(R = Responsible, A = Accountable, C = Consulted, I = Informed)

## Used by
- `governance/02_GOVERNANCE_STRUCTURES.md` (function-level companion view to the
  role-level RACI Chart)
- Lab `GOVERNANCE_LAB_BUILD_GOVERNANCE_CHARTER.md`

## Reconciliation
`TABLE_LIBRARY.md` already indexes a "RACI Chart" entry
(`governance/02_GOVERNANCE_STRUCTURES.md`) with columns Activity, Responsible,
Accountable, Consulted, Informed — a generic role-based RACI table structure. This file
is **not a duplicate**: it is a populated, function-specific variant of that same RACI
concept, with the R/A/C/I roles broken out into named governance functions (Board,
Executive, Risk, Compliance, Security) as columns instead of being free-text role names
in a single column. Both serve the same lesson, at two levels: the library entry defines
the generic RACI table shape, this file shows it instantiated for governance functions.
