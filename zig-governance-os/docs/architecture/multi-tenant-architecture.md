# Multi-Tenant Architecture

> STATUS: STUB — see CLAUDE.md and .claude/skills/zig-fable5-methodology/SKILL.md for the
> build methodology. This file must be filled in with real, production-grade content
> before its Fable phase is considered complete (no more headers/bullets describing what
> should go here — actual schema, actual copy, actual numbers).

## Required content

- Tenant boundary model: every record scoped to Organization, then Project
- Row-level isolation strategy (not just UI-level filtering)
- Role definitions and permission matrix: Organization Admin, GRC Manager, Risk Analyst, Compliance Analyst, Auditor, Consultant, Viewer
- Consultant cross-organization access model
- Org/project switching UX and session model

