# Zig Governance OS - Domain Model

## Identity & Multi-Tenancy

### Tenant

Represents an organization using Zig.

### User

Represents a user belonging to a tenant.

### Role

Defines permissions and access levels.

---

## Governance

### Project

A governance, risk, compliance, audit, or implementation initiative.

### Framework

A compliance framework such as ISO 27001, NIST CSF, SOC 2, HIPAA, PCI DSS, or CIS Controls.

### Control

A specific control requirement within a framework.

### ControlMapping

Maps controls across frameworks.

---

## Risk Management

### Asset

A business, technology, data, or operational asset.

### Risk

A threat or risk associated with an asset.

### RiskAssessment

Stores likelihood, impact, severity, and treatment decisions.

---

## Evidence & Audit

### Evidence

Documentation or proof supporting a control.

### Task

An action item assigned to a user.

### Audit

An audit engagement or assessment.

---

## Learning Platform

### LearningPath

A structured learning journey.

### LearningModule

An individual lesson, lab, or exercise.

### Assessment

A quiz, exam, or practical evaluation.

---

## Scenario Engine

### Scenario

A simulated governance or compliance situation.

### ScenarioRun

A user's execution of a scenario.

---

## Analytics

### GovernanceScore

Overall governance maturity and health score.

### Recommendation

AI-generated recommendation for improvement.
