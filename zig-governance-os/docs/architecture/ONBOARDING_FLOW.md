# Onboarding Flow

```text
Supabase Auth Account
  -> Create Organization
  -> Create Tenant Admin Profile
  -> Seed Tenant Framework Registry
  -> Store Tenant Context
  -> Create Project
  -> View Dashboard
```

`TenantService.createOrganization()` creates the tenant. The tenant id becomes the isolation boundary for every later query.

`UserService.createProfile()` creates the first tenant user with role `Tenant Admin`, persona `Tenant Admin`, and the Supabase Auth user id.

Onboarding copies the canonical framework registry into tenant-scoped `frameworks` rows so project creation has service-backed options immediately.
