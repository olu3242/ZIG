# Third-Party Risk Map (Detail Spec)

## Purpose
Detail spec for the "Third-Party Risk Map" diagram already indexed in `DIAGRAM_LIBRARY.md`.
This is a content spec only — no rendering implementation.

## Structure

```
                        ┌──────────────┐
                        │   Tier 1     │  High data access
                        │  (innermost) │  (e.g. cardholder data, PHI)
                        └──────┬───────┘
                   ┌───────────┴───────────┐
              ┌────┴────┐             ┌────┴────┐
              │ Tier 2  │             │ Tier 2  │   Medium data access
              └────┬────┘             └────┬────┘
            ┌───────┴──────┐        ┌───────┴──────┐
        ┌───┴───┐      ┌───┴───┐ ┌──┴────┐    ┌────┴───┐
        │Tier 3 │      │Tier 3 │ │Tier 3 │    │Tier 3  │   Low data access
        └───────┘      └───────┘ └───────┘    └────────┘
```

Vendor tiers radiate outward from the organization's core systems; risk exposure
decreases as data-access level decreases, but the map shows all tiers simultaneously so
learners see the full third-party attack surface at once, not just the highest-risk ring.

## Used by
- `vendor_risk/04_*`
- Cross-references `DIAGRAM_LIBRARY.md` → "Third-Party Risk Map"

## Reconciliation
This is a direct reuse of `DIAGRAM_LIBRARY.md`'s existing "Third-Party Risk Map" entry
("Vendor tiers radiating risk exposure by data-access level") — no change to the depicted
content, just the detailed text/ASCII rendering spec the indexed entry did not yet have.
