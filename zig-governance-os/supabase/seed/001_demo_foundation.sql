-- Demo foundation seed for local development.
-- This is intentionally small and tenant-scoped.

insert into tenants (id, slug, name, status, settings, branding, subscription)
values (
  '00000000-0000-4000-8000-000000000001',
  'demo-saas-company',
  'Demo SaaS Company',
  'active',
  '{"riskAppetite":"moderate"}',
  '{"displayName":"Demo SaaS Company","primaryColor":"#15202B","accentColor":"#D9A441"}',
  '{"plan":"business","status":"trialing","seats":12}'
)
on conflict (id) do nothing;

select set_config('app.current_tenant_id', '00000000-0000-4000-8000-000000000001', false);

insert into frameworks (id, tenant_id, code, name, version, description)
values
  ('00000000-0000-4000-8000-000000000101', current_tenant_id(), 'ISO27001', 'ISO 27001', '2022', 'Information security management system controls.'),
  ('00000000-0000-4000-8000-000000000102', current_tenant_id(), 'SOC2', 'SOC 2', '2022 Trust Services Criteria', 'Trust Services Criteria for service organizations.'),
  ('00000000-0000-4000-8000-000000000103', current_tenant_id(), 'NIST_CSF', 'NIST Cybersecurity Framework', '2.0', 'Cybersecurity outcomes for governance programs.')
on conflict (tenant_id, code, version) do nothing;
