# AI Coach Workflow Certification

**Date:** 2026-06-20
**Scope:** Close the AI Coach workflow end-to-end (start conversation → send message →
real, explainable reply → dashboard/visible history), per
`docs/certification/E2E_GAP_REPORT.md` (#8 AI Coach — FAIL: "static cards, no
conversation/message table") and `docs/certification/WORKFLOW_TRACEABILITY_MATRIX.md`
("AI Coach Session: Table(s) = none — no conversation table", one of only 3 workflows
described as "blocked at the schema level").

## Module-surface note

Unlike Vendor (PRD Section 11) and Career (PRD Section 12), this workflow requires **no**
new PRD gap-justification section: AI Coach lives inside **AI Command Center**, which is
already module #9 on `CLAUDE.md`'s canonical 11-module list. This closure is new schema
and service work *within* an existing module, not a 12th/13th module.

## Schema

**New migration:** `supabase/migrations/202606180015_ai_coach_e2e.sql`

A grep across every migration for "conversation", "chat_message", "coach_session" before
this change returned no table definitions (confirmed, not assumed) — consistent with the
finding already written in `docs/academy/AI_COACH_ARCHITECTURE.md`. Two new tables were
required, exactly as that document proposed (Section 2), not redesigned:

- **`coach_conversations`** — `id`, `tenant_id`, `learner_user_id`, `context_type`
  (`check`: `learning_path|lesson|assessment|lab|general`), `context_id` (nullable,
  type depends on `context_type`), `started_at`, audit columns.
- **`coach_messages`** — `id`, `tenant_id`, `conversation_id` (FK), `role` (`check`:
  `learner|coach`), `content`, plus the explainability columns CLAUDE.md requires of any
  AI output: `reasoning`, `supporting_data` (jsonb), `confidence`, `framework_reference`.

RLS + `updated_at` trigger wired via the same `do $$ ... $$` loop pattern used in every
prior migration this phase. No existing migration or table was modified.

## Types / data-access layer

- `packages/types/src/index.ts`: added `CoachContextType`, `CoachConversation`,
  `CoachMessageRole`, `CoachMessage`, placed before `GovernanceScore`.
- `packages/data-access/src/records.ts`: added `CoachConversationRecord`,
  `CoachMessageRecord` (same `& { createdAt; updatedAt }` pattern as every other record).
- `packages/data-access/src/repositories.ts`: added `coachConversations`, `coachMessages`
  to `ZigRepositories`, registered for both the Supabase-backed and in-memory adapters
  (table names `coach_conversations`, `coach_messages`).

## Service layer — `packages/services/src/CoachService.ts` (new)

**KEEP/EXTEND/MERGE/REMOVE decision: NEW service, not an extension.** Unlike Vendor
(extended `RiskService`) and Career (extended `LearningService`), no existing service owns
a conversation/message concept or the risk+control+student-twin combination a coach reply
needs to read across — extending any single existing service would mean that service
reaching into repositories it has no other reason to hold. `CoachService` extends
`BaseService<CoachConversationRecord>` and takes `coachConversations`, `coachMessages`,
`risks`, `controls`, `studentTwins` as constructor dependencies. Exposes:

- **`startConversation(context, contextType, contextId?)`** — real insert into
  `coach_conversations`, immediately followed by a real, persisted welcome `coach_messages`
  row (not a static greeting).
- **`sendMessage(context, conversationId, content)`** — persists the learner's message,
  then computes and persists a coach reply via `generateReply`.
- **`findConversations`, `findMessages`** — real, filtered reads.

### Why no LLM call

`docs/academy/AI_COACH_ARCHITECTURE.md` Section 5 explicitly left "which LLM
provider/model to use, and how API keys/secrets would be managed" as an open
product/infra decision out of scope for documentation work. No LLM client exists anywhere
in this repo (confirmed by grep before this change, matching the architecture doc's own
finding). Rather than fabricate a call to a provider that isn't configured, `CoachService`
`generateReply` is a deterministic, rule-based responder grounded in **real tenant data**:

- Reads real `risks` and `controls` rows for the tenant and the current actor's
  `student_twins` row.
- Computes `openRiskCount` (risks whose `treatment` is not yet `mitigate`/`transfer`),
  `controlCoverage` (% of controls with `status: "implemented"`), and the learner's
  `learningScore`.
- Branches on those real counts to produce one of three reply types (open risks present →
  prioritize highest-risk treatment; no open risks but incomplete control coverage →
  close remaining controls; otherwise → healthy-posture acknowledgment), each carrying a
  reasoning string, the `supportingData` it computed from, a `confidence` value, and (for
  the first two branches) a real `frameworkReference`.
- This satisfies CLAUDE.md's "every AI recommendation must be explainable (reason, data,
  confidence, framework reference)" rule without depending on unconfigured infrastructure.

`packages/services/src/factory.ts` updated to construct `CoachService` and expose it as
`services.coach` — a new top-level service key, justified because AI Coach is itself one of
the product's 11 canonical top-level modules (#9), not a sub-entity of another module the
way Vendor/Career are.

## Routes — `apps/web/app/ai-command/page.tsx` (rewritten)

- Replaced the three static `StatCard`s (`value="0"`, `value="N/A"`) with real counts:
  total coach messages, average persisted confidence across coach replies, and how many
  replies carried a framework reference.
- Replaced the four unwired "Command Starter" buttons with a real "Start a Conversation"
  form (context-type selector) posting to `startCoachConversationAction`.
- Renders every persisted conversation with its full message history (role, content,
  reasoning, confidence, framework reference) and a real "Send" form per conversation
  posting to `sendCoachMessageAction`.

## Server actions — `apps/web/app/lib/actions.ts`

Added `startCoachConversationAction`, `sendCoachMessageAction`, following the exact pattern
of `startVendorAssessmentAction`/`completeVendorAssessmentAction` — each requires tenant
context, calls a real `CoachService` method, records an audit event, redirects to
`/ai-command`.

## Dashboard

`apps/web/app/lib/data.ts` `loadDashboard()` — added a real
`services.coach.findConversations(context)` call, surfaced as
`stats.coachConversationCount`. `loadCoach()` added for the new page.
`apps/web/app/dashboard/page.tsx` — added an "AI Coach Conversations" stat card.

## What is honestly NOT fully closed

1. **No real LLM integration.** Replies are deterministic and rule-based, grounded in real
   data, but are not generated by a language model — per the still-unresolved, explicitly
   out-of-scope provider/infra decision in `docs/academy/AI_COACH_ARCHITECTURE.md` Section
   5. This is an honest, explainable stand-in, not a disguised constant: it changes when
   the underlying risk/control data changes (verified by the test below).
2. **No conversation-level context use.** `context_id` is accepted and persisted but
   `generateReply` does not yet read the linked learning path/lesson/assessment/lab row to
   tailor its reply further — it grounds in tenant-wide risk/control/student-twin data
   regardless of `context_type`.
3. **No message editing/deletion, no conversation archiving.** Matches the same
   scoped-out-on-purpose pattern as Vendor's missing offboarding flow.
4. **No live Supabase verification.** Verified against `createInMemoryRepositories()` via
   the runtime test below; the Supabase-backed path was typechecked/built successfully but
   not exercised against a real database in this sandbox.

## Verification performed

- **`npm run typecheck` (root)** — PASS, zero errors.
- **`npm run build` (root)** — PASS. `/ai-command` appears in the `web` route manifest.
- **Unit test added and executed:**
  `packages/services/src/tests/ai-coach-workflow.test.ts`, following the established
  self-executing-assertion pattern. Exercises: start a conversation with no risks/controls
  yet (asserts a persisted conversation + welcome message carrying `reasoning` and
  `confidence`) → create a real unmitigated risk → send a learner message (asserts the
  learner message persists, and the coach reply's `supportingData.openRiskCount` is `1` —
  a real count, not a constant — and carries a `frameworkReference`) → re-read full message
  history (asserts 3 persisted messages: welcome + learner + coach). Run with
  `npx tsx src/tests/ai-coach-workflow.test.ts` from `packages/services/` — **exited 0**.
- **Regression check:** `learning-workflow`, `assessment-workflow`, `lab-workflow`,
  `evidence-workflow`, `vendor-risk-workflow`, `career-readiness-workflow`,
  `service-layer`, `vertical-slice` tests were all re-run the same way and all
  **exited 0**, confirming this change did not break any prior workflow.
