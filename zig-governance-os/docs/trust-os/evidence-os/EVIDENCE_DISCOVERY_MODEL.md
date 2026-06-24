# Evidence OS — Discovery Model

> Batch 26. Search sources for finding evidence across the platform, and a future-state list
> of external integrations. This is the model `questionnaire-os/EVIDENCE_DISCOVERY_MODEL.md`
> (Batch 15) defers to as "owned by Evidence OS" — this document is that owner.

## Search sources (today, internal)

| Source | Existing artifact | Status |
|---|---|---|
| Policies | `policies` table | EXISTS |
| Controls (their existing evidence) | `control_evidence` (canonical per Batch 22), `EvidenceService.findByControl` | EXISTS, REUSE |
| Questionnaires | `questionnaires`/`responses`/`evidence_references` (net-new, per `questionnaire-os/QUESTIONNAIRE_DATA_MODEL.md`, Batch 12) | NEW — once Questionnaire OS ships, its `EvidenceReference` rows are themselves a discoverable evidence-usage source (an evidence item that has already answered a similar question elsewhere) |
| Assessments | `assessments` table | EXISTS at data layer, no service |
| Audits | `audits`, `audit_findings` | EXISTS at data layer, no service |
| Trust center | No `trust_centers` table exists (confirmed missing in `TRUST_OS_EXISTING_TABLES_MAP.md`, Batch 1, and re-verified: no migration creates this table) | MISSING — flagged as a future Trust OS surface, not an Evidence OS dependency today |
| Vendor reviews | `vendors`, `vendors.questionnaire jsonb` | EXISTS, narrow (single jsonb blob per vendor, no structured review history) |

## Search flow (design only)

```
Query (control_id, framework_requirement_id, domain, and/or free text)
   │
   ▼
1. Exact: control_evidence WHERE control_id = X                      [REUSE pattern]
   │
   ▼
2. Framework-equivalent: control_mappings → other controls satisfying
   the same framework requirement → their control_evidence rows        [REUSE via ControlService.findMappings]
   │
   ▼
3. Cross-reference: questionnaire EvidenceReference rows where the
   same control_id was already cited in a prior questionnaire response  [NEW — requires Questionnaire OS to exist]
   │
   ▼
4. Domain/keyword broadened search across policies/assessments/audits  [NEW logic]
   │
   ▼
Ranked candidate list, each tagged with its source tier (1-4 above)
```

This is the same tiering shape as `questionnaire-os/EVIDENCE_MATCHING_RULES.md`'s Tier 1-3
(intentionally consistent naming/structure across both PRs — Evidence OS's tiers 1-2 here
correspond to Questionnaire OS's Tier 1-2 exactly; Evidence OS adds tiers 3-4 because it
serves a broader discovery purpose than just answering one question).

## Future external sources (explicitly out of scope to build, listed per the task)

SharePoint, Confluence, Google Drive, OneDrive, other GRC platforms. None of these have any
existing integration code found in `packages/*/src/` related to evidence specifically —
the existing `integration_*`/`connector_*` table family (confirmed present in
`TRUST_OS_EXISTING_TABLES_MAP.md`'s Tier 3 list, Batch 1) is generic integration
infrastructure not yet wired to evidence discovery. Evidence OS's future-state discovery
would extend that generic connector family rather than building new per-source code paths,
consistent with the project's general "extend, don't fork" pattern established across every
batch in this audit.
