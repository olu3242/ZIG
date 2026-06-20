# Dependency Maps (Detail Spec)

## Purpose
Detail spec reusing the existing "Dependency Map" diagram from `DIAGRAM_LIBRARY.md`. This
is a content spec only — no rendering implementation.

## Structure

```
Upstream Systems → [ ASSET ] → Downstream Systems
   (DNS, IdP,         |           (Reporting, billing,
    Network)          |            customer-facing apps)
                       |
                  Dependencies:
                  - Power / facilities
                  - Third-party vendors
                  - Personnel / key-person risk
```

Each critical asset is mapped with its upstream dependencies (what it needs to function)
and downstream dependents (what breaks if it fails), so learners can trace single points of
failure across the full chain, not just at the asset itself.

## Used by
- `bcm_dr/02_*`
- Cross-references `DIAGRAM_LIBRARY.md` → "Dependency Map"

## Reconciliation
Direct reuse of `DIAGRAM_LIBRARY.md`'s existing "Dependency Map" entry ("Asset →
upstream/downstream system dependencies") — no change to the depicted content, just the
detailed text/ASCII rendering spec the indexed entry did not yet have.
