# Security Governance Track

Trains learners on designing controls across ISO 27001, SOC 2, and NIST CSF — backed by
`ControlService` (`controls`, `control_mappings`) and `FrameworkService`.

## Learning path: Cross-Framework Security Control Design

| Module | Type | Duration |
|---|---|---|
| One Control, Many Frameworks: Designing for Reuse | lesson | 30 min |
| Control Ownership and Lifecycle Status | lesson | 25 min |
| Evidence Requirements per Control | lesson | 25 min |
| Design a Control Set for CloudPay (ISO 27001 + SOC 2) | lab | 60 min |
| Map CloudPay's Controls to NIST CSF | exercise | 45 min |

## Notes

- Maps to `ControlService.findMappings` (`ControlMapping` records) and `Control.status`
  (`ControlStatus` union: planned/implemented/needs_evidence/accepted).
- Final exercise uses the CloudPay scenario (`docs/scenarios/CLOUDPAY.md`).
