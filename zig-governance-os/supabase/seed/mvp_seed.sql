-- MVP convergence seed data.
-- Run after migrations. Tenant-scoped to the demo tenant.

select set_config('app.current_tenant_id', '00000000-0000-4000-8000-000000000001', false);

insert into organizations (id, tenant_id, name, slug)
values ('00000000-0000-4000-8000-000000000201', current_tenant_id(), 'Demo SaaS Company', 'demo-saas-company')
on conflict (slug) do nothing;

insert into roles (tenant_id, name, description)
values
  (current_tenant_id(), 'student', 'Learner using paths, labs, and coach guidance.'),
  (current_tenant_id(), 'practitioner', 'GRC practitioner completing operational work.'),
  (current_tenant_id(), 'auditor', 'Auditor reviewing evidence and findings.'),
  (current_tenant_id(), 'manager', 'Manager accountable for remediation and reporting.'),
  (current_tenant_id(), 'admin', 'Tenant administrator.'),
  (current_tenant_id(), 'super_admin', 'Platform administrator.')
on conflict (tenant_id, name) do nothing;

insert into frameworks (tenant_id, code, name, version, description)
values
  (current_tenant_id(), 'ISO27001', 'ISO 27001', '2022', 'Information security management system controls.'),
  (current_tenant_id(), 'SOC2', 'SOC 2', 'Trust Services Criteria', 'Service organization controls readiness.'),
  (current_tenant_id(), 'NIST_CSF', 'NIST CSF', '2.0', 'Cybersecurity governance and risk outcomes.'),
  (current_tenant_id(), 'NIST_RMF', 'NIST RMF', 'SP 800-37', 'Risk management framework for systems.'),
  (current_tenant_id(), 'CIS_V8', 'CIS Controls', 'v8', 'Prioritized security safeguards.'),
  (current_tenant_id(), 'HIPAA', 'HIPAA', 'Security Rule', 'Administrative, physical, and technical safeguards.'),
  (current_tenant_id(), 'PCI_DSS', 'PCI DSS', '4.0', 'Payment card data security requirements.')
on conflict (tenant_id, code, version) do nothing;

insert into ai_conversations (tenant_id, coach_id, title, context)
values
  (current_tenant_id(), 'zig-coach', 'ZIG Coach', '{"focus":"general guidance"}'),
  (current_tenant_id(), 'audit-coach', 'Audit Coach', '{"focus":"audit preparation"}'),
  (current_tenant_id(), 'risk-coach', 'Risk Coach', '{"focus":"risk scoring"}'),
  (current_tenant_id(), 'compliance-coach', 'Compliance Coach', '{"focus":"framework mapping"}'),
  (current_tenant_id(), 'career-coach', 'Career Coach', '{"focus":"career readiness"}');

do $$
declare
  path_titles text[] := array[
    'ISO 27001 Foundations','SOC 2 Practitioner','NIST CSF 2.0 Governance','Risk Register Builder','Vendor Risk Essentials',
    'Evidence Operations','Internal Audit Ready','HIPAA Security Rule','PCI DSS Readiness','GRC Analyst Career Launch'
  ];
  lab_titles text[] := array[
    'ISO Internal Audit','SOC Readiness Review','Vendor Risk Assessment','Risk Register Workshop','Evidence Collection Exercise',
    'Policy Review Sprint','HIPAA Safeguards Lab','PCI Scope Mapping','Audit Finding Remediation','Executive Board Briefing'
  ];
  vendor_names text[] := array[
    'Microsoft','Google','AWS','Okta','CrowdStrike','Salesforce','Slack','GitHub','Vercel','Stripe',
    'Workday','ServiceNow','Atlassian','Datadog','Snowflake','Zoom','DocuSign','Box','Cloudflare','HubSpot'
  ];
  evidence_titles text[] := array[
    'Information Security Policy','Access Review Export','Risk Assessment','Audit Report','Vendor Review','Training Record',
    'Incident Response Test','Business Continuity Test','Change Management Sample','Encryption Standard','Asset Inventory',
    'Vulnerability Scan','Backup Restoration Evidence','Board Risk Summary','Data Retention Procedure','Exception Approval',
    'Control Test Workpaper','Security Awareness Completion','Logging Configuration','Third-Party Contract Review'
  ];
  i int;
  path_id uuid;
  module_id uuid;
  project_id uuid := '00000000-0000-4000-8000-000000000301';
  asset_id uuid := '00000000-0000-4000-8000-000000000302';
begin
  insert into projects (id, tenant_id, name, industry, status)
  values (project_id, current_tenant_id(), 'MVP Practice Workspace', 'SaaS', 'active')
  on conflict (id) do nothing;

  insert into assets (id, tenant_id, project_id, name, category, criticality)
  values (asset_id, current_tenant_id(), project_id, 'Production SaaS Platform', 'Application', 'high')
  on conflict (id) do nothing;

  for i in 1..10 loop
    path_id := gen_random_uuid();
    insert into learning_paths (id, tenant_id, title, description, progress_percent)
    values (path_id, current_tenant_id(), path_titles[i], 'MVP learning path for operational GRC practice.', (i * 7) % 100);

    for module_index in 1..3 loop
      module_id := gen_random_uuid();
      insert into learning_modules (id, tenant_id, learning_path_id, title, module_type, duration_minutes)
      values (module_id, current_tenant_id(), path_id, path_titles[i] || ' Module ' || module_index, 'lesson', 45);

      for lesson_index in 1..case when i <= 6 or (i = 7 and module_index <= 2) then 2 else 1 end loop
        insert into lessons (tenant_id, learning_module_id, title, content, duration_minutes, sort_order)
        values (
          current_tenant_id(),
          module_id,
          'Operational GRC lesson ' || lesson_index,
          'Learner produces a concrete GRC workpaper, control map, evidence request, or remediation action.',
          18,
          lesson_index
        );
      end loop;
    end loop;
  end loop;

  for i in 1..10 loop
    insert into labs (tenant_id, title, scenario, tasks, expected_deliverables, scoring_rubric)
    values (
      current_tenant_id(),
      lab_titles[i],
      'Realistic GRC operating scenario requiring assessment, evidence, and executive-ready recommendations.',
      '["Read scenario","Map controls","Generate evidence","Write recommendation"]'::jsonb,
      '["Control map","Evidence list","Risk summary","Remediation plan"]'::jsonb,
      '["Accuracy","Evidence quality","Risk reasoning","Clarity"]'::jsonb
    );
  end loop;

  for i in 1..20 loop
    insert into vendors (tenant_id, name, category, inherent_risk, assessment_status, risk_rating, questionnaire)
    values (
      current_tenant_id(),
      vendor_names[i],
      (array['Cloud','Identity','Security','CRM','Developer','Finance'])[1 + ((i - 1) % 6)],
      lower((array['Low','Medium','High'])[1 + ((i - 1) % 3)]),
      lower(replace((array['Not Started','In Progress','Complete'])[1 + ((i - 1) % 3)], ' ', '_')),
      60 + ((i * 7) % 36),
      '["Security policy","Access reviews","Encryption","Incident notification","Independent assurance"]'::jsonb
    )
    on conflict (tenant_id, name) do nothing;
  end loop;

  for i in 1..20 loop
    insert into audit_logs (tenant_id, action, entity_type, metadata)
    values (current_tenant_id(), 'seed', 'evidence_template', jsonb_build_object('title', evidence_titles[i], 'status', (array['current','pending_review','missing'])[1 + ((i - 1) % 3)]));
  end loop;

  for i in 1..25 loop
    insert into risks (tenant_id, project_id, asset_id, title, description, severity, treatment, residual_risk)
    values (
      current_tenant_id(),
      project_id,
      asset_id,
      (array['Privileged access review delays','Incomplete vendor security review','Cloud storage misconfiguration','Policy exception without approval','Evidence expires before audit window'])[1 + ((i - 1) % 5)],
      'Seeded MVP risk for hands-on risk register practice.',
      (array['low','medium','high','critical'])[1 + ((i - 1) % 4)],
      lower((array['Mitigate','Transfer','Accept','Avoid'])[1 + ((i - 1) % 4)]),
      (array['low','medium','high'])[1 + ((i - 1) % 3)]
    );
  end loop;
end $$;
