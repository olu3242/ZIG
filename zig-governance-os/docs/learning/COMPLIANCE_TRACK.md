# Compliance Track

Trains learners on framework requirements, control mapping, and compliance status —
backed by `FrameworkService` and `ControlService` (`ControlMapping` records). No separate
`ComplianceStatusService`/`FrameworkMappingService` exists on `main` at the time of
writing; compliance status is derived from `Control.status` + `ControlMapping`, not a
dedicated service.

## Learning path: Framework Compliance Operations

| Module | Type | Duration |
|---|---|---|
| Framework Requirements as Metadata, Not Modules | lesson | 25 min |
| Mapping One Control Across Multiple Frameworks | lesson | 35 min |
| Reading a Compliance Status Report | lesson | 25 min |
| Map RetailNova's Controls to PCI DSS and SOC 2 | lab | 55 min |
| Close RetailNova's Top Compliance Gaps | exercise | 45 min |

## Notes

- Maps to `ControlService` (`ControlMapping` records) and `Control.status`; reinforces the
  hard rule that frameworks are metadata attached to controls/evidence, not separate code
  paths.
- Final exercise uses the RetailNova scenario (`docs/scenarios/RETAILNOVA.md`), chosen for
  its multi-framework (PCI DSS + SOC 2) profile.
