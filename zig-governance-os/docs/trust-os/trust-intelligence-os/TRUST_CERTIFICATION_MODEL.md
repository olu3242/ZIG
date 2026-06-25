# Trust Certification Engine (Batch 58)

STATUS: Design document. Documentation only. No code, migrations, or routes.

## Naming collision finding — stated explicitly, as required

The Batch 51 audit read `packages/certification-journeys/src/index.ts` (6 lines: a union
type of 8 journey names — `iso_lead_implementer`, `soc2_practitioner`, etc. — and a class
with one method returning that static list) and `packages/certification-readiness/src/index.ts`
(6 lines: one method computing an unweighted average of 6 inputs — knowledge,
practicalSkills, labCompletion, scenarioCompletion, capstones, interviewReadiness).

**Both existing packages are individual/learner-level concepts** — they certify a
*person's* readiness for a named professional journey (e.g. "this learner is ready for
the ISO Lead Implementer path"), as part of Learning OS / Career OS. The corresponding
database tables (`certifications`, `user_certifications` in
`202606190003_mvp_plus_launch_schema.sql`; `certification_journeys`,
`certification_score` in `202606180008_learning_agent_workforce.sql`) are likewise
learner-scoped.

**This is a genuine naming collision requiring disambiguation.** "Trust Certification" as
specified in this batch is an **organization-level** concept — it certifies a tenant's
*governance program*, not an individual learner. The two are unrelated in subject (org
vs. person) despite sharing the word "certification." This document disambiguates them
explicitly rather than reusing or extending the existing learner-certification packages:

| | Existing (`certification-journeys`, `certification-readiness`) | Trust Certification Engine (this batch) |
|---|---|---|
| Subject | An individual learner/professional | An organization's governance program (tenant) |
| Input | Knowledge, lab completion, capstones, interview readiness | Trust Score band + Trust Maturity Model level |
| Output | A learner's readiness for a named career journey | A program-level badge: Bronze/Silver/Gold/Platinum/Continuous Trust |
| Owning domain | Learning OS / Career OS | Trust Intelligence OS |
| Tables today | `certifications`, `user_certifications`, `certification_journeys` (learner-scoped, real RLS) | None exist; none proposed in this batch |

No code or schema change is proposed to rename, merge, or migrate the existing
learner-certification tables or packages. They remain exactly as they are. Trust
Certification Engine is a new, distinctly-named concept that happens to reuse the English
word "certification" — the recommendation for any future implementation phase is to
keep the UI labels unambiguous (e.g. "Professional Certification" vs. "Trust
Certification" or "Organization Trust Certification") to prevent user confusion, since the
underlying systems will likely coexist.

## Levels

Bronze, Silver, Gold, Platinum, Continuous Trust — five levels, **tied directly to the
Trust Maturity Model's levels 0-5 and Trust Score bands (PR #7)**, not arbitrary badge
thresholds invented for this batch:

| Trust Certification Level | Trust Maturity Model Level | Indicative Trust Score band |
|---|---|---|
| (Uncertified) | Level 0 | Below initial threshold |
| Bronze | Level 1 | Entry-level passing band |
| Silver | Level 2 | Mid band |
| Gold | Level 3 | Strong band |
| Platinum | Level 4 | Excellent band |
| Continuous Trust | Level 5 | Sustained excellence over time, not just a point-in-time score — requires Trust Analytics (Batch 52) trend data showing the Platinum-level Trust Score has been sustained over a defined period (e.g. consecutive quarters), since "Continuous" should mean demonstrated over time, not a one-time snapshot. |

The exact numeric Trust Score band boundaries are owned by PR #7's Trust Maturity Model
document, not redefined here — this batch only states the mapping principle (certification
level = function of existing maturity level + score band + trend), so that Trust
Certification never becomes a second, conflicting maturity scale.

## What triggers re-certification or de-certification

- A sustained drop in Trust Score below a level's band (detected via Batch 52 trend)
  should trigger a re-assessment, not an immediate silent downgrade — consistent with the
  explainability principle (an org should know why and what to fix before losing a
  level).
- Continuous Assurance (Batch 54) Critical-severity findings left unresolved past a
  defined window should be eligible to block progression to the next level even if the
  raw Trust Score would otherwise qualify, so certification reflects operational health,
  not just a number.

## Relationship to other batches

- Maturity/score inputs: PR #7 (Trust Score, Trust Maturity Model) — Reuse, not
  redefinition.
- Trend/sustained-level inputs: Batch 52 (Trust Analytics).
- Blocking-condition inputs: Batch 54 (Continuous Assurance findings).
- Surfaces in: Batch 57 (Executive Intelligence — Trust Status), Batch 59 (Trust
  Intelligence Dashboard — Certifications section), Batch 60 (Trust OS Maturity
  Platform — the "Certify" stage of the 10-stage journey).
