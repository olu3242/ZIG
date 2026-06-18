# Billing Architecture

Zig billing is tenant-owned and Stripe-ready. The first implementation uses Stripe Billing APIs with Checkout Sessions for subscription purchase and the Customer Portal for self-service plan management.

Core tables: `billing_accounts`, `plans`, `plan_features`, `subscriptions`, `usage_events`, `invoices`, `payments`, `payment_methods`, and `billing_audit_events`.

Tenant rules:
- Every billing row includes `tenant_id`, `created_by`, `updated_by`, `created_at`, and `updated_at`.
- RLS policies enforce `tenant_id = current_tenant_id()`.
- Platform Owner pages can inspect global billing readiness through admin routes.

Stripe webhook events mapped: checkout completion, customer creation, invoice lifecycle, payment success/failure, and subscription create/update/delete.
