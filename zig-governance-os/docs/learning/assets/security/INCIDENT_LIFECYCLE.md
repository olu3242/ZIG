# Incident Lifecycle (Detail Spec)

## Purpose
Detail spec for incident response stages, presented as a five-stage cycle that folds
"Triage" into "Detect" rather than treating it as a separate stage. This is a content spec
only — no rendering implementation.

## Structure

```
Detect → Contain → Eradicate → Recover → Lessons Learned
```

| Stage | What happens |
|---|---|
| Detect | Incident identified and triaged — severity, scope, and affected assets assessed as part of detection |
| Contain | Spread halted, affected systems isolated |
| Eradicate | Root cause removed (malware, compromised credentials, vulnerability) |
| Recover | Systems restored to normal operation, validated clean |
| Lessons Learned | Post-incident review, control gaps identified, process updated |

## Used by
- `security_governance/03_*`
- Cross-references `DIAGRAM_LIBRARY.md` → "Incident Lifecycle"

## Reconciliation
`DIAGRAM_LIBRARY.md`'s existing "Incident Lifecycle" entry is **Detect → Triage → Contain →
Eradicate → Recover → Lessons Learned** (six stages). This version omits "Triage" as a
separate stage — it is folded into "Detect," since in practice initial severity/scope
assessment happens in the same motion as detection. This is a teaching simplification for
lessons that want a five-beat cycle; it does not change the six-stage library entry, which
remains the canonical version for the indexed diagram.
