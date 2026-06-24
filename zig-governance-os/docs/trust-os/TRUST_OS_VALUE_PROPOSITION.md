# Trust OS Value Proposition

> Batch 3. Written as a direct extension of `docs/vision/positioning.md`'s differentiators
> section, in the same numbered-list voice.

## Core value proposition

Zig Trust OS lets an organization prove it is trustworthy in the time it takes to share a
link, instead of the time it takes to fill out another spreadsheet — because every claim it
makes is generated from the same connected governance data Zig already maintains, not
retyped for the occasion.

## Differentiators (extending `docs/vision/positioning.md:41-55`)

1. **One trust surface, one source of truth.** Trust Score, the Trust Center, and
   questionnaire answers all read from the same Governance Score inputs
   (`governance_scores` table, `supabase/migrations/202606180001_batch_21_core_data_platform.sql:285-298`),
   the same `EvidenceService`, and the same Framework metadata as the rest of Zig — never a
   parallel "trust" database that can drift from what's actually governed.
2. **An AI Questionnaire Agent that answers from evidence, not from memory.** Most
   organizations answer the same vendor security questionnaire by having someone retype the
   same paragraph from last quarter. Zig's Questionnaire Agent drafts answers directly from
   current control and evidence records, with the same explainability contract as every
   other Zig AI output (reason, supporting data, confidence — `CLAUDE.md:122-125`), and a
   human always approves before it's sent.
3. **A Trust Score, not a re-badged checklist.** Trust Score extends the existing,
   explainable Governance Score with Vendor and AI Governance dimensions rather than
   introducing a second, black-box trust number — see `TRUST_SCORE_MODEL.md` for the exact
   relationship.
4. **AI governance on the same graph as everything else.** Most "AI governance" tooling is
   a bolt-on policy checklist disconnected from the rest of a compliance program. Trust OS
   models AI assets, AI risks, AI controls, and AI decisions as one more branch of the same
   Knowledge Graph that already connects Organization → Project → Asset → Risk → Control →
   Framework → Evidence → Assessment (`TRUST_KNOWLEDGE_GRAPH.md`), using the governed-entity
   pattern Zig already proved on its own internal AI agents
   (`governed_agents`/`agent_certifications`, `supabase/migrations/202606180009_agent_governance_os.sql`).
5. **Built for the people who have to keep the trust story current**, not just the
   compliance team writing it once a year — zero stale artifacts, an evidence-backed Trust
   Center that updates as the governance program changes, and one-click drafting on every
   incoming questionnaire the same way the Health Advisor already offers one-click
   remediation on governance gaps (`CLAUDE.md:117-118`).

## Who feels the value first

- A **GRC manager** stops manually compiling a "trust packet" for every sales deal — the
  Trust Center is always current.
- A **sales/security engineer** answers a 200-question vendor questionnaire in an afternoon
  instead of a week, because the Questionnaire Agent has already drafted most of it from
  real evidence.
- A **customer or prospect** gets a live, evidence-backed trust posture instead of a PDF
  that was true six months ago.
- An **auditor** gets the same connected evidence trail Zig already promises
  (`docs/vision/product-vision.md:32-33`), now also exposed in a form their client's
  customers can see.
