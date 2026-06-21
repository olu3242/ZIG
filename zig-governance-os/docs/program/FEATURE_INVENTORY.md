# Zig MVP Feature Inventory

Status date: 2026-06-20

| Feature | Stage | Status | Dependencies | Certification State | Coverage | Risk | Owner |
| --- | --- | --- | --- | --- | ---: | --- | --- |
| Authentication | Foundation | Built | Supabase config | Partial | 85% | Medium | Delivery Office |
| Organizations | Foundation | Built | Auth | Partial | 85% | Medium | Delivery Office |
| Memberships | Foundation | Built | Organizations | Partial | 85% | Medium | Delivery Office |
| Roles | Foundation | Built | Memberships | Partial | 80% | Medium | Delivery Office |
| Onboarding | Foundation | Built | Auth/orgs | Partial | 80% | Medium | Delivery Office |
| Projects | CREATE | Built | Organization | FAIL | 90% | High | Delivery Office |
| Assets | CREATE | Built | Project | FAIL | 90% | High | Delivery Office |
| Controls | CREATE | Built | Project | FAIL | 90% | High | Delivery Office |
| Asset-control mappings | CREATE | Built | Assets/controls | FAIL | 90% | High | Delivery Office |
| Activities | CREATE | Built | CREATE actions | FAIL | 85% | High | Delivery Office |
| Governance Score V1 | CREATE | Built | Project/assets/controls/mappings | FAIL | 85% | High | Delivery Office |
| Mission Control Foundation | CREATE/REPORT | Built | CREATE metrics | FAIL | 70% | High | Delivery Office |
| Risk register | ASSESS | Missing/seeded shell | CREATE PASS | Locked | 5% | High | Delivery Office |
| Risk scoring/heatmap | ASSESS | Missing | Risk register | Locked | 0% | High | Delivery Office |
| Framework engine | ASSESS | Partial metadata | CREATE PASS | Locked | 10% | High | Delivery Office |
| Readiness engine | ASSESS | Missing | Risks/framework mappings | Locked | 0% | High | Delivery Office |
| Gap analysis | ASSESS | Partial synthetic shell | Readiness | Locked | 5% | High | Delivery Office |
| Tasks | IMPROVE | Missing | ASSESS PASS | Locked | 0% | High | Delivery Office |
| Recommendations | IMPROVE | Missing | Gaps/tasks | Locked | 0% | High | Delivery Office |
| Health Advisor | IMPROVE | Missing | Recommendations | Locked | 0% | High | Delivery Office |
| Scenario runtime | IMPROVE | Shell/design | ASSESS PASS | Locked | 5% | Medium | Delivery Office |
| Portfolio artifacts | IMPROVE/REPORT | Missing | Scenario/report data | Locked | 0% | Medium | Delivery Office |
| Reports | REPORT | Catalog shell | IMPROVE PASS | Locked | 5% | High | Delivery Office |
| Exports | REPORT | Missing | Reports | Locked | 0% | High | Delivery Office |
| Executive insights | REPORT | Missing | Full lifecycle data | Locked | 0% | Medium | Delivery Office |

## Inventory Decision

The inventory confirms the bottleneck is proof, not broad architecture.

Next work:

```text
CREATE Closure Sprint
```
