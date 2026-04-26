# Legacy Mapping

Source:

- Legacy package: [`.legacy/cna-templates/packages/admin`](/C:/NexusCanon/afenda-react-vite/.legacy/cna-templates/packages/admin)
- Package location: [`packages/admin`](/C:/NexusCanon/afenda-react-vite/packages/admin)

## Preserved

- `TenantManager`
- `SystemMonitor`
- `AuditService`
- exported singleton instances for quick adoption

## Intentionally changed

- `slug` now maps to `tenantCode`
- `tier` now lives in `tenants.metadata.admin.tier`
- enabled modules now live in `tenants.metadata.admin.enabledModules`
- tenant activation/deactivation now maps to canonical `status` and `activationDate` / `deactivationDate`
- admin-user bootstrap now creates `iam.user_accounts` + `iam.tenant_memberships`, not an ad hoc `role` column
- audit writes only allow canonical `AuditActionKey` values from `@afenda/database`

## Not ported 1:1

- fake NATS and Redis health values
- random module response times
- direct raw Prisma access
- pervasive `any`
- undeclared feature-flag and shared-package dependencies from `@vierp/*`
