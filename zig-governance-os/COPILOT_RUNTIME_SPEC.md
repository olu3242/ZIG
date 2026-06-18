# Copilot Runtime Specification

The compliance copilot runtime makes Zig Intelligence context-aware across modules, frameworks, tenants, roles, and tasks.

## Implementation

- Package: `packages/copilot-runtime`
- Engine: `CopilotRuntime`
- Actions: create project, create risk, generate policy, generate audit plan, map controls, generate evidence requests, create vendor assessment, generate executive briefing
- Output: deterministic action plan key scoped by tenant, role, and module
