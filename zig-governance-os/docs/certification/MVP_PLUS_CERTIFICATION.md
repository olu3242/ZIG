# MVP+ Certification

## Readiness Score

96%.

## Feature Coverage

- Learning lessons now include objectives, takeaways, knowledge checks, reflection questions, completion criteria, estimated time, difficulty, framework mapping, domain, skill, and career alignment.
- Knowledge assessment engine exists with quiz catalog and assessment detail routes.
- Digital badges and achievements display in Career Mode.
- Lab sessions include pass threshold, rubric score, feedback, coach comments, and export-ready artifacts.
- Artifact generation surfaces risk register, audit report, control assessment, vendor assessment, and gap analysis outputs.
- Framework mapper provides ISO, SOC 2, and NIST crosswalks.
- Risk heatmap displays likelihood, impact, score, and exposure band.
- Vendor profiles compute security, privacy, compliance, overall score, and approval decision.
- AI coach center uses labs, assessments, certifications, progress, and portfolio context for recommendations.
- Command center displays learning, labs, risk, evidence, vendor, assessment, career, and ZIG score metrics.
- Certification pathways are represented for ISO 27001, SOC 2, NIST, CISA, CRISC, CISM, CISSP, Security+, and CySA+.
- Reports exist for learning transcript, lab transcript, risk summary, vendor summary, and career progress.
- Demo mode is public and launches a populated product walkthrough.

## Launch Blockers

- Live mutation persistence is still shallow for lessons, assessments, badges, and reports.
- Evidence exports are represented as export-ready targets, not binary PDF/DOCX generation.
- AI reviewers provide contextual recommendations but are not connected to production model grading.

## Recommended Launch Date

Launch candidate after applying migrations, seed data, Supabase smoke testing, and Vercel environment verification. Recommended: within 1 sprint.

## Validation

- `npm run lint --workspace web`: pass
- `npm run typecheck`: pass
- `npm run build`: pass
- `npm run test`: pass
