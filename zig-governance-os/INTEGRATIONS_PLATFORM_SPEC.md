# Integrations Platform Spec

Zig integrations are provider-first and tenant-scoped.

Provider categories: identity, ticketing, communication, storage, source control, cloud, security, compliance, and billing.

Runtime entities:
- `integration_providers`
- `integration_connections`
- `integration_credentials`
- `integration_sync_jobs`
- `integration_sync_history`
- `integration_webhooks`
- `integration_events`
- `integration_health`

Health dimensions: connection status, last sync, failed syncs, webhook health, rate limits, credential expiry, and integration errors.
