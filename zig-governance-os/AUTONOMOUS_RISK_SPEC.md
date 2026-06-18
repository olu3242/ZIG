# Autonomous Risk Specification

The autonomous risk engine ingests risk signals and converts them into prioritization scores and treatment guidance.

## Implementation

- Package: `packages/autonomous-risk`
- Engine: `AutonomousRiskEngine`
- Signals: control failures, audit findings, vendor changes, threat intelligence, policy violations, configuration drift
- Outputs: risk priority score and recommendation text
