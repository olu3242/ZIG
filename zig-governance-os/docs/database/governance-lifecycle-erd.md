# Governance Lifecycle ERD

## Certified Identity Foundation

```text
auth.users
  -> profiles
  -> organization_memberships
  -> organizations
```

## Lifecycle Graph

```text
organizations
  -> projects
     -> assets
        -> risks
           -> controls
              -> evidence
                 -> tasks
                    -> reports
```

## Framework Graph

```text
frameworks
  -> framework_requirements
     -> control_mappings
        -> controls
```

## Stage 1 Implemented Relationships

| Parent | Child | Relationship |
| --- | --- | --- |
| `organizations` | `projects` | `projects.organization_id` |
| `projects` | `assets` | `assets.project_id` |
| `projects` | `controls` | `controls.project_id` |
| `frameworks` | `projects` | `projects.framework_focus` |
| `organizations` | `activities` | `activities.organization_id` |

## Stage 2+ Defined Relationships

| Parent | Child | Future Relationship |
| --- | --- | --- |
| `assets` | `risks` | Risk is tied to affected asset |
| `risks` | `controls` | Control reduces risk |
| `controls` | `evidence` | Evidence proves control operation |
| `framework_requirements` | `control_mappings` | Mapping explains requirement coverage |
| `recommendations` | `tasks` | One-click remediation creates task |
| `reports` | lifecycle graph | Report snapshots posture |
