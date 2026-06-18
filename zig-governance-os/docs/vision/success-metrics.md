# Success Metrics — Zig

## Activation

- **Time to first generated program**: median time from signup to a fully AI-generated
  asset/risk/control baseline. Target: under 10 minutes.
- **Time to first end-to-end journey completion**: signup → org → project → generated
  program → first reviewed asset/risk/control → first evidence upload → first report.
  Target: under 20 minutes (this is the MVP's defining benchmark — see
  `docs/product/mvp-definition.md`).
- **% of new projects that reach a non-zero governance score within 24 hours** of creation.

## Engagement and depth of use

- **Governance score trend per project** over time (the core north-star metric: is the
  program actually maturing, not just existing).
- **Health Advisor recommendations accepted vs. dismissed**, and time-to-remediation for
  accepted ones.
- **% of controls with evidence attached**, **% of risks with an assigned owner**, **% of
  framework requirements with at least one mapped control** — these feed directly into the
  governance score and are worth tracking independently to catch where programs stall.
- **Reports generated per project per month** — a proxy for whether the platform is being
  used for real audit/customer-facing work, not just left idle after setup.

## Breadth

- **Number of active organizations** and, for consultants, **organizations managed per
  consultant account**.
- **Framework coverage distribution** — which of ISO 27001 / SOC 2 / NIST CSF / CIS
  Controls / HIPAA / PCI DSS are actually in active use, to prioritize framework-engine
  investment.
- **Scenario usage**: % of organizations that create, fork, or clone a scenario, as a
  signal of whether the Scenario Workspace is being used for genuine planning rather than
  ignored.

## Quality and trust

- **AI recommendation acceptance rate**, broken out by recommendation type (program
  generation, risk generation, control generation, framework mapping) — a low acceptance
  rate on any one type signals an explainability or accuracy problem worth fixing before it
  erodes trust elsewhere.
- **Health Advisor false-positive rate** (gaps flagged that a user marks as not applicable)
  — kept low so recommendations stay credible.
- **Zero-empty-state compliance**: percentage of screens that, when audited, contain demo
  data, an AI entry point, or a clear next action with no real content present. Target:
  100%.
