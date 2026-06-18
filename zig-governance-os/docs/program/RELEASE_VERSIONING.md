# Release Versioning

## Tag Conventions

| Tag | Meaning |
|---|---|
| `v0.1-foundation` | Documentation OS, product shell, execution governance |
| `v0.2-data-platform` | Database, repository, service layer |
| `v0.3-identity-platform` | Authentication, authorization, tenant onboarding |
| `v0.4-governance-core` | Controls, risks, evidence, assessment core |
| `v0.5-mvp` | Usable vertical-slice MVP |
| `v1.0-launch` | Production launch release |

## Versioning Rules

- Tags are created only from `main`.
- Every release tag requires passing release gates.
- Release notes must reference implementation reports and open issues.
- Database migration state must be documented for all data-platform tags.
