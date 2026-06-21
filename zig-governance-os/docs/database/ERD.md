# ZIG MVP Domain ERD

Generated: 2026-06-20

## Target Domain Model

```text
public.profiles
  ↓
public.organizations
  ↓
public.user_roles

learning.learning_paths
  ↓
learning.courses
  ↓
learning.modules
  ↓
learning.lessons
  ↓
learning.lesson_progress

frameworks.frameworks
  ↓
frameworks.framework_domains
  ↓
frameworks.framework_mappings

simulation.companies
  ↓
simulation.departments
  ↓
simulation.employees
  ↓
simulation.scenarios
  ↓
simulation.artifacts

assessment.assessments
  ↓
assessment.questions
  ↓
assessment.attempts

portfolio.portfolio_artifacts

certification.certifications
  ↓
certification.user_certifications

ai.coaching_sessions
  ↓
ai.recommendations
```

## MVP Access Bridge

```text
auth.users
  ↓ trigger
public.profiles
  ↓
public.organizations
  ↓
public.user_roles
```

## Learning-To-Portfolio Path

```text
learning.learning_paths
  ↓
learning.modules
  ↓
learning.lessons
  ↓
assessment.assessments
  ↓
assessment.attempts
  ↓
simulation.scenarios
  ↓
simulation.artifacts
  ↓
portfolio.portfolio_artifacts
  ↓
certification.user_certifications
```

## Framework-To-Simulation Path

```text
frameworks.frameworks
  ↓
frameworks.framework_domains
  ↓
frameworks.framework_mappings
  ↓
simulation.scenarios
  ↓
simulation.artifacts
```

## Notes

This ERD is the target schema boundary, not a claim that these objects currently exist in the configured database. The actual database must be inventoried with `scripts/audit-supabase-schemas.sql` before creating or extending tables.
