# E2E Gap Analysis

Status: **ACTIVE**

## Critical Gaps

| Gap | Impact | Dependencies | Complexity | Estimated Effort |
| --- | --- | --- | --- | --- |
| CREATE browser evidence missing | Blocks ASSESS and all MVP certification | Real deployed browser session, authenticated user, screenshots | Medium | 1 sprint |
| CREATE RLS proof missing | Blocks production confidence | Second tenant/user or SQL impersonation test | Medium | 1 sprint |
| Runtime/database mapping unresolved | Blocks trust in deployed validation | Confirm Vercel env and Supabase env point to same project | Medium | 0.5 sprint |
| Risk engine missing | Blocks ASSESS | CREATE PASS | Medium | 1 sprint |
| Framework requirements/mappings missing | Blocks readiness | Risk/control model | High | 1 sprint |
| Readiness engine missing | Blocks recommendations | Risks + framework mappings | High | 1 sprint |

## High Gaps

| Gap | Impact | Dependencies | Complexity | Estimated Effort |
| --- | --- | --- | --- | --- |
| Gap analysis engine missing | Blocks Health Advisor | Readiness and framework coverage | Medium | 0.5-1 sprint |
| Task engine missing | Blocks IMPROVE | ASSESS PASS | Medium | 1 sprint |
| Recommendation engine missing | Blocks guided improvement | Gaps/readiness/risk signals | High | 1 sprint |
| Health Advisor missing | Blocks continuous improvement | Recommendation rules and tasks | High | 1 sprint |

## Medium Gaps

| Gap | Impact | Dependencies | Complexity | Estimated Effort |
| --- | --- | --- | --- | --- |
| Scenario runtime missing | Blocks learning-through-execution | CREATE/ASSESS core records | Medium | 1 sprint |
| Portfolio artifacts missing | Blocks learner/consultant deliverables | Scenario/report outputs | Medium | 1 sprint |
| Executive reports missing | Blocks leadership value | Full lifecycle data | Medium | 1 sprint |
| PDF/DOCX exports missing | Blocks report certification | Report engine | Medium | 0.5-1 sprint |

## Low Gaps

| Gap | Impact | Dependencies | Complexity | Estimated Effort |
| --- | --- | --- | --- | --- |
| Trend analysis missing | Useful for REPORT, not MVP core until data exists | Historical snapshots | Medium | Later |
| Executive insights missing | Useful after REPORT data exists | Trends and report runs | Medium | Later |
| Learning runtime expansion | Moat, not required before core lifecycle | IMPROVE scenario runtime | High | Later |

## Priority Order

1. Prove CREATE in browser.
2. Fix any runtime/database environment mismatch.
3. Prove RLS.
4. Build/certify ASSESS.
5. Build/certify IMPROVE.
6. Build/certify REPORT.
