# Trust OS — Existing Routes Map

> Batch 1. Full top-level route inventory from `apps/web/app/` (Next.js App Router). Listed
> from a direct directory walk; nothing here is proposed.

## All top-level route segments found under `apps/web/app/`

```
(auth)/forgot-password, (auth)/login, (auth)/signup
academy
agents
ai-command
api/debug, api/health
apprenticeship
assessment, assessment/[id]
assets
audits
auth, auth/callback, auth/success
automation
board
career
certifications
coach
command-center
compliance-command-center
controls
corporate-academy
dashboard
demo
developer, developers
digital-twin
employers
employment
enterprise-learning
evidence, evidence/[id]
executive-assurance
exports
framework-mapper
frameworks, frameworks/[id], frameworks/iso27001
gaps
imports
integrations
labs, labs/[id], labs/session
learning, learning/[id], learning/career, learning/community, learning/instructor,
  learning/lesson, learning/marketplace, learning/module, learning/practice-lab
learning-command-center
marketplace
mission-control
oauth, oauth/callback
onboarding (+ access, career-goals, complete, experience, frameworks, organization,
  profile, review)
partners
policies
portfolio
projects, projects/[id], projects/demo-project, projects/new
reports
risk, risk/[id], risk/heatmap, risk/new
risks
scenarios
services
settings, settings/billing, settings/organization
skills
university
vendors, vendors/[id]
```

## Routes directly relevant to Trust OS

| Route | Status | Notes |
|---|---|---|
| `apps/web/app/vendors/page.tsx`, `apps/web/app/vendors/[id]/page.tsx` | EXISTS | Vendor list and vendor detail. This is the closest existing surface to a future Trust Center/Vendor Risk module. No service backs it yet (see services map). |
| `apps/web/app/evidence/page.tsx`, `apps/web/app/evidence/[id]/page.tsx` | EXISTS | Evidence list and detail — the natural home/extension point for an Evidence Vault. |
| `apps/web/app/audits/` | EXISTS | Maps to the `audits`/`audit_findings` table family. |
| `apps/web/app/certifications/` | EXISTS | Maps to `certifications`/`user_certifications` — currently learner-credential scope. |
| `apps/web/app/gaps/` | EXISTS | Maps to `gap_assessments`. |
| `apps/web/app/compliance-command-center/` | EXISTS | Closest existing surface to a future executive Trust Score / posture dashboard — maps conceptually to `compliance_snapshots`. |
| `apps/web/app/executive-assurance/` | EXISTS | Another existing candidate surface for Trust Score / board-level trust reporting — should be checked for overlap before adding a new "Trust Center" route. |
| `apps/web/app/framework-mapper/`, `apps/web/app/frameworks/` | EXISTS | Framework metadata browsing/mapping UI. |
| `apps/web/app/policies/` | EXISTS | Maps to `policies`/`policy_attestations`. |
| `apps/web/app/digital-twin/` | EXISTS | Simulated-organization surface; not Trust OS scope but named similarly enough to flag. |
| `apps/web/app/ai-command/`, `apps/web/app/command-center/` | EXISTS | AI Command Center surfaces (per CLAUDE.md's 11-module spec) — the natural home for any future AI Governance UI, rather than a new standalone route. |

## Confirmed MISSING — no such route exists

No `trust`, `trust-center`, or `questionnaire` directory exists anywhere under
`apps/web/app/`. Any Trust Center or Questionnaire Agent UI proposed in later batches is
genuinely net-new at the routing layer, though it should be evaluated against
`compliance-command-center/` and `executive-assurance/` first to avoid shipping three
dashboards that all claim to be "the trust view."
