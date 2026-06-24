# Trust OS Vision

> Batch 3. Written to match the voice and structure of `docs/vision/product-vision.md` —
> same "why it exists / who it serves / what problems it solves / why it's different"
> shape, extended to the trust layer rather than restated as a separate product.

## Why Trust OS exists

Zig Trust OS is the operating layer that continuously proves organizational trustworthiness
through evidence, controls, governance, risk intelligence, and AI assurance.

Today, trustworthiness is something organizations *assert* — in a security questionnaire
answered once a quarter, a SOC 2 report emailed as a PDF, a vendor risk spreadsheet that
goes stale the day after it's filled in. None of these artifacts are connected to the
governance work that actually backs them. Zig already solved the connected-data half of
this problem with the Universal Governance Model (`Organization → Project → Asset → Risk →
Control → Framework Requirement → Evidence → Task → Report`, `CLAUDE.md:95`) and an
explainable Governance Score. Trust OS is what happens when that same connected model is
turned outward: instead of a number only the GRC team sees, it becomes a continuously
current, evidence-backed trust posture that customers, auditors, and boards can see for
themselves.

## Who it serves

Trust OS extends Zig's existing personas (`docs/vision/positioning.md:14-25`) rather than
introducing new ones:

- **GRC managers and compliance leads**, who today maintain the governance program but have
  no single place to *show* it without exporting reports by hand.
- **Security/sales engineers**, a persona Zig does not yet explicitly serve, who field the
  same vendor security questionnaire dozens of times a quarter and need an AI-assisted way
  to answer it from the same evidence the GRC team already maintains.
- **Auditors**, who already get a "clean, evidence-backed trail" from Zig
  (`docs/vision/product-vision.md:32-33`) — Trust OS gives that trail a continuously-current,
  externally shareable form.
- **Customers and prospects evaluating a vendor's trustworthiness**, who are not Zig users
  themselves but are the audience of the Trust Center — the first audience-facing surface
  Zig produces for people outside the governance team.

## What problems it solves

1. **The repeated-questionnaire problem.** Every customer security review re-asks questions
   the organization has already answered with evidence already in Zig. Trust OS's
   Questionnaire Agent answers from the same connected model the GRC team already
   maintains, instead of a salesperson retyping the same answers from memory.
2. **The stale-trust-artifact problem.** A SOC 2 report or security one-pager is true the
   day it's issued and progressively less true after. Trust OS's Trust Score is computed
   continuously from live governance data — controls implemented, evidence coverage, risk
   treatment, vendor posture, AI governance — the same way the existing Governance Score
   already is (`governance_scores` table, `supabase/migrations/202606180001_batch_21_core_data_platform.sql:285-298`),
   not re-issued on a schedule.
3. **The disconnected-vendor-risk problem.** Zig already tracks vendors
   (`vendors` table, `supabase/migrations/202606190002_mvp_convergence_schema.sql:85-97`)
   but with no service layer and a single freeform `questionnaire` jsonb column. Trust OS
   gives vendor risk the same connected, evidence-backed treatment as every other entity in
   the Universal Governance Model.
4. **The ungoverned-AI problem.** Organizations are starting to be asked "how do you govern
   your AI systems," and most have no answer that looks like the rest of their governance
   program. Trust OS extends the same governed-entity pattern Zig already uses for its own
   internal AI agents (`governed_agents`, `agent_certifications`,
   `supabase/migrations/202606180009_agent_governance_os.sql:55-94`) to customer-facing AI
   assets, risks, controls, and decisions — so AI governance is one more branch of the same
   graph, not a separate AI compliance tool.

## Why it's different

Trust OS is not a trust-badge widget or a static "we are SOC 2 compliant" banner. It is the
trust-facing expression of a governance program that is already real, connected, and
explainable — every claim a Trust Center makes traces back through the same graph that
already produces the Governance Score, the same evidence the Evidence Workspace already
manages, and the same framework metadata the Framework Engine already maintains. Where
other trust-center products are a marketing layer disconnected from the actual GRC tooling,
Zig's Trust Center cannot say anything its own governance data doesn't already support —
because it is reading the same records, not a separate marketing database.
