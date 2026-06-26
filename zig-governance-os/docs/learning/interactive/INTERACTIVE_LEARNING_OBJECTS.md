# Interactive Learning Objects

## Purpose
Defines the interactive (not just visual) layer of the Learning OS — the 20% of the
70/20/10 rule in `VISUAL_LEARNING_STANDARD.md`. Each object below names a specific
manipulable version of a static asset already indexed in the 7 libraries, and states what
action the learner takes. None of these are implemented yet — see
`INTERACTIVE_RENDERING_SPEC.md` for the eventual component contract.

## The 8 interactive objects

| Object | Static asset it interacts with | Learner action |
|---|---|---|
| Interactive Risk Heatmap | `docs/learning/HEATMAP_LIBRARY.md` → Risk Heatmap | Drag a risk onto the likelihood/impact grid; system shows resulting score and treatment urgency |
| Interactive Framework Map | `docs/learning/FRAMEWORK_MAP_LIBRARY.md` → ISO/NIST/SOC2 Crosswalk | Select a control, see it highlight across all mapped framework clauses simultaneously |
| Interactive Control Matrix | `docs/learning/FRAMEWORK_MAP_LIBRARY.md` → Control Coverage Matrix | Toggle a framework on/off and watch coverage % recompute live |
| Interactive Audit Timeline | `docs/learning/TABLE_LIBRARY.md` → Audit Timeline | Drag a milestone to reschedule; dependent milestones shift automatically |
| Interactive Org Chart | `docs/learning/ORG_CHART_LIBRARY.md` → Committee Structure / scenario org charts | Click a role to see its decision-rights scope and current owner |
| Interactive Vendor Ecosystem | `docs/learning/HEATMAP_LIBRARY.md` → Vendor Risk Heatmap, `docs/learning/TABLE_LIBRARY.md` → Vendor Tier Matrix | Reassign a vendor's tier and see monitoring-cadence recommendation update |
| Interactive Incident Flow | `docs/learning/DIAGRAM_LIBRARY.md` → Incident Lifecycle | Step through Detect→Contain→Eradicate→Recover→Lessons Learned, entering a decision at each stage |
| Interactive Compliance Dashboard | `docs/learning/TABLE_LIBRARY.md` → scenario Compliance Coverage Maps | Filter by framework/control status, see readiness % recompute live |

## Backing data
Each interactive object reads from the same real entities its static counterpart already
cites (`RiskAssessment`, `ControlMapping`, `GovernanceScore`, scenario
`simulated_company_objects`, etc.) — no new tables or services. The "interactive" layer is
a client-side manipulation of already-fetched data, not a new data source.

## How this relates to labs
Every lab in `docs/learning/labs/*.md` that names a heatmap, matrix, or workflow as a
deliverable input should eventually use the corresponding interactive object instead of a
static image, once `INTERACTIVE_RENDERING_SPEC.md` is implemented. This doc does not
change any lab's Tasks/Deliverables/Scoring Rubric — only how the underlying visual is
presented.

## What this wave does NOT do
- Does not implement any interactive component.
- Does not add client-side state management, drag-and-drop libraries, or any frontend
  dependency.
- Does not change any lab's scoring rubric or task list.
