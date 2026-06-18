# User Journeys — Zig

## Primary journey: from signup to a governance program in under 20 minutes

This is the journey the entire MVP is built to support end to end. Every module exists to
make a step in this journey real, not theoretical.

```
1. Signup
2. Create Organization
3. Create Project
4. Generate Governance Program   (AI Program Generator, via Guided Project Builder)
5. Review Assets
6. Review Risks
7. Review Controls
8. Upload Evidence
9. Receive Recommendations        (Health Advisor)
10. Improve Governance Score
11. View Readiness                (Framework Engine / Readiness Engine)
12. Generate Executive Report
```

### Step-by-step detail

1. **Signup** — user creates an account. No org or project exists yet.
2. **Create Organization** — user names their organization; this becomes the top-level
   tenant boundary for everything that follows.
3. **Create Project** — a project sits under the organization (e.g. "SOC 2 Readiness 2026"
   or "Series A Security Review"). A consultant may have several organizations, each with
   one or more projects.
4. **Generate Governance Program** — the Guided Project Builder asks a short set of intake
   questions (industry, size, target frameworks, existing maturity if any) and the AI
   Program Generator produces a starting set of assets, risks, and controls, framework-
   mapped from the moment they're created. This is the moment that replaces the "blank
   page problem" described in the product vision.
5. **Review Assets** — user opens the Asset Workspace, sees the AI-generated inventory
   pre-populated (never empty), and edits, confirms, or adds assets.
6. **Review Risks** — same pattern in the Risk Workspace: AI-generated risks tied to the
   reviewed assets, with severity and likelihood pre-populated and editable.
7. **Review Controls** — Control Workspace shows controls already mapped to risks and to
   framework requirements; user confirms ownership and implementation status.
8. **Upload Evidence** — user attaches evidence to controls in the Evidence Workspace;
   evidence completeness becomes one of the governance score inputs immediately.
9. **Receive Recommendations** — the Health Advisor, running continuously rather than on
   demand, surfaces what's still missing (an unowned risk, a control with no evidence, a
   framework requirement with no mapped control) with severity, explanation, and a
   one-click remediation where possible.
10. **Improve Governance Score** — as the user acts on recommendations, the explainable
    governance score updates and shows exactly which input moved and why.
11. **View Readiness** — the Framework Engine's Readiness Engine shows, per framework, how
    close the project is to attestation-ready, broken down by requirement.
12. **Generate Executive Report** — Executive Reporting produces a portfolio artifact
    (governance summary, readiness report, gap assessment, or full register) directly from
    the live data model, downloadable and ready to share with leadership, a customer, or an
    auditor.

## Secondary journey: consultant managing multiple organizations

```
Login → Switch Organization → Open Project → Use AI Command Center to stand up a new
client's program → Fork/Clone a Scenario from a prior similar client → Adjust for this
client's context → Hand off to client's own Compliance Analyst for day-to-day maintenance
```

## Secondary journey: ongoing maintenance after initial setup (Risk/Compliance Analyst)

```
Open Mission Control → See Health Advisor's current top recommendations → Act on highest-
severity gap → Update affected Asset/Risk/Control/Evidence records → Governance score
updates → Check Task Workspace for anything assigned to them → Mark tasks complete
```

## Secondary journey: auditor review

```
Receive Auditor-role access to a Project → Open Executive Reporting / Portfolio Artifacts →
Review the Readiness Report and Control Library with attached Evidence → Drill from a
specific framework requirement down to the controls and evidence that satisfy it
```
