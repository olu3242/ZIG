# Execution Tracks

## Purpose

Zig has enough roadmap. The execution problem is sequencing work into outcome-driven tracks so implementation produces a usable platform instead of disconnected modules.

This document is the weekly build guide for future implementation batches.

## Track 1: MVP Release

Target: first 90 days.

Implementation queue:

```text
21A Database Foundation
21B Repository & Service Layer
22 Identity Platform
23 Governance Graph
25 Control Engine
26 Evidence Engine
27 Assessment & Audit
28 Governance Score
29 Mission Control
MVP Release
```

Success criteria:

```text
User can:

Create Tenant
Create Project
Select Framework
Manage Controls
Upload Evidence
Run Assessment
View Governance Score
Generate Report
```

This is the minimum viable Zig that first paying customers can use.

## Track 2: Learning Platform

Target: months 4-6.

Implementation queue:

```text
30 Learning OS
31 Scenario Lab
36 GRC Practice Lab
37 Career Mode
46 Governance University
```

Success criteria:

```text
User can:

Learn
Practice
Assess
Earn Credentials
Build Portfolio
```

This is where Zig surpasses traditional GRC tools.

## Track 3: AI Platform

Target: months 6-9.

Implementation queue:

```text
14 AI Coach
15 AI Command Center
44 Digital Workforce
49 Autonomous Governance Cloud
```

Success criteria:

```text
AI can:

Recommend
Assess
Generate Controls
Generate Risks
Generate Evidence Plans
Generate Audit Programs
```

AI work must not bypass tenant isolation, auditability, approval flows, or traceability.

## Track 4: Certification Platform

Target: months 9-12.

Implementation queue:

```text
35 Certification Readiness
45 Zig Governance Standard
48 Global Certification Platform
```

Success criteria:

```text
User can:

Learn
Practice
Assess
Certify
Verify Credentials
```

Certification work depends on controls, evidence, assessments, audits, learning, scenarios, and credential registry foundations.

## Track 5: Ecosystem

Target: year 2.

Implementation queue:

```text
38 Marketplace
41 Governance Network
42 Governance Exchange
43 Trust Graph
47 Governance Cloud Ecosystem
```

Success criteria:

```text
Organizations
Consultants
Auditors
Students
Employers

all interact in Zig
```

Ecosystem work must not begin until the MVP platform and core trust primitives are stable.

## Immediate Implementation Queue

Stop generating future roadmap batches. The current execution queue is:

```text
1. Batch 21A
2. Batch 21B
3. Batch 22
4. Batch 23
5. Batch 25
6. Batch 26
7. Batch 27
8. Batch 28
9. Batch 29
```

These nine batches produce the first real Zig MVP customers can use.

## Gap Closure Overlay

The enterprise gap analysis in `docs/product/gap-analysis.md` and `docs/release/zig-gap-closure-roadmap.md` adds a planning overlay, not a replacement for the immediate queue.

The top foundational gaps are:

- Workflow OS
- Policy Management
- Document Management
- Vendor Risk
- Incident Management
- Issue Management
- Integration Hub
- API Platform
- Observability Platform
- Billing Platform

Do not implement these out of order. Introduce them only when their dependency batch makes them necessary, and only after their PRD, architecture, data, security, and acceptance docs exist.

## Dependency Rules

- Batch 21A and 21B must be reconciled with the already-created Batch 21 core data platform.
- Batch 22 cannot proceed without database, repository, service, tenant isolation, and audit foundations.
- Batch 23 cannot proceed without identity and tenant context.
- Batch 25-29 must not bypass the Governance Graph.
- Learning, AI, marketplace, ecosystem, and cloud work remain expansion layers until Track 1 is complete.
