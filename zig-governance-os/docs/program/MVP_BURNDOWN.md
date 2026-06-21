# Zig MVP Burndown

Status date: 2026-06-20

## Summary

| Metric | Count |
| --- | ---: |
| Total MVP feature groups | 20 |
| Built feature groups | 11 |
| Certified feature groups | 0 |
| Blocked feature groups | 9 |
| Remaining certification gates | 4 |

## Feature Groups

| Feature Group | Stage | Build Status | Certification Status | Remaining Work |
| --- | --- | --- | --- | --- |
| Authentication | Foundation | Built | Partial | Final E2E proof |
| Organizations | Foundation | Built | Partial | Browser/database proof |
| Memberships | Foundation | Built | Partial | Browser/database proof |
| Roles | Foundation | Built | Partial | RLS proof |
| Onboarding | Foundation | Built | Partial | Live flow proof |
| Projects | CREATE | Built | FAIL | Browser acceptance |
| Assets | CREATE | Built | FAIL | Browser acceptance |
| Controls | CREATE | Built | FAIL | Browser acceptance |
| Asset-control mappings | CREATE | Built | FAIL | Browser/database proof |
| Activities | CREATE | Built | FAIL | UI/database proof |
| Governance Score V1 | CREATE | Built | FAIL | Mission Control proof |
| Risks | ASSESS | Missing | Locked | Build after CREATE PASS |
| Framework engine | ASSESS | Partial metadata | Locked | Build after risk engine |
| Readiness | ASSESS | Missing | Locked | Build after framework coverage |
| Gap analysis | ASSESS | Partial shell | Locked | Build after readiness |
| Tasks | IMPROVE | Missing | Locked | Build after ASSESS PASS |
| Recommendations | IMPROVE | Missing | Locked | Build after tasks/gaps |
| Health Advisor | IMPROVE | Missing | Locked | Build after recommendations |
| Reports/exports | REPORT | Missing | Locked | Build after IMPROVE PASS |
| Executive insights | REPORT | Missing | Locked | Build after report data |

## Readiness

| Area | Score |
| --- | ---: |
| Foundation | 85% |
| CREATE build | 90% |
| CREATE certification | 0% |
| ASSESS | 5% |
| IMPROVE | 0% |
| REPORT | 5% |
| Overall MVP | 35% |

## Burn Direction

Next burndown target:

```text
CREATE certification: 0% -> 100%
Overall MVP readiness: 35% -> 45%
```
