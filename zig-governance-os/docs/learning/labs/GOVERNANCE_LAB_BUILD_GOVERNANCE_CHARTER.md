# Governance Lab: Build a Governance Charter

## Scenario
GovSec (`docs/scenarios/GOVSEC.md`).

## Inputs
- GovSec's existing governance score and open `Recommendation` records
- Role/Permission model (7-role union in `packages/types/src/index.ts`)
- Lessons 01-02 of the Governance track (Foundations, Structures)

## Tasks
1. Define GovSec's governance committee structure (board, steering committee, working groups).
2. Assign decision rights for accepting recommendations of each severity level.
3. Document escalation paths for unresolved critical recommendations.
4. Map each structure element to the Universal Governance Model entity it governs.

## Deliverables
- Governance Charter document: committee structure, decision-rights matrix, escalation paths.

## Scoring Rubric
| Criterion | Weight |
|---|---|
| Every committee role maps to a real Universal Governance Model entity | 25% |
| Decision rights are unambiguous for all 4 severity levels | 25% |
| Escalation path has no dead ends (every path reaches a decision-maker) | 25% |
| Charter is specific to GovSec's actual open recommendations, not generic | 25% |

## AI Feedback Rules
ZARA (`docs/coaching/ZARA_PERSONA.md`) reviews as **Reviewer**: flags any committee role
with no mapped entity, any decision-rights gap, and any escalation path that dead-ends
before reaching a role with "approve" or "accept" permission.
