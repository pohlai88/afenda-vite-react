# Sync-Pack Golden Examples

These are the governed internal Sync-Pack examples.

Use `pnpm run feature-sync:verify` for daily operator validation.
Use `pnpm run feature-sync:intent`, `pnpm run feature-sync:intent-check`, `pnpm run feature-sync:sync-examples`, and `pnpm run feature-sync:quality-validate` when changing the SDK/package itself.

## Golden examples

### internal-support-crm

- Path: `docs/sync-pack/generated-packs/business-saas/internal-support-crm`
- Category: `business-saas`
- Name: Internal Support CRM
- Fitness: `pass` on SDK `0.0.0`
- When to start: Start here for internal service desks, support queues, CRM-style account operations, or workflow-heavy business tooling.
- When not to start: Do not start here for analytics-first products, IAM/control-plane work, or lightweight utility apps.
- Follow-up commands:
  - `pnpm run feature-sync:generate -- --pack <pack-id>`
  - `pnpm run feature-sync:check`
  - `pnpm run feature-sync:verify`
  - `pnpm run feature-sync:quality-validate` when the SDK/package changed

### bi-reporting-starter

- Path: `docs/sync-pack/generated-packs/data-analytics/bi-reporting-starter`
- Category: `data-analytics`
- Name: BI Reporting Starter
- Fitness: `pass` on SDK `0.0.0`
- When to start: Start here for internal analytics, BI reporting, metric exploration, or operational dashboard work.
- When not to start: Do not start here for transactional back-office flows, IAM platforms, or support CRM products.
- Follow-up commands:
  - `pnpm run feature-sync:generate -- --pack <pack-id>`
  - `pnpm run feature-sync:check`
  - `pnpm run feature-sync:verify`
  - `pnpm run feature-sync:quality-validate` when the SDK/package changed

### uptime-monitoring-workbench

- Path: `docs/sync-pack/generated-packs/infrastructure-operations/uptime-monitoring-workbench`
- Category: `infrastructure-operations`
- Name: Uptime Monitoring Workbench
- Fitness: `pass` on SDK `0.0.0`
- When to start: Start here for observability, monitoring, incident response, SRE tooling, or infrastructure operations work.
- When not to start: Do not start here for business workflow systems, BI-heavy products, or identity-control platforms.
- Follow-up commands:
  - `pnpm run feature-sync:generate -- --pack <pack-id>`
  - `pnpm run feature-sync:check`
  - `pnpm run feature-sync:verify`
  - `pnpm run feature-sync:quality-validate` when the SDK/package changed

### iam-sso-control-plane

- Path: `docs/sync-pack/generated-packs/security-privacy/iam-sso-control-plane`
- Category: `security-privacy`
- Name: IAM SSO Control Plane
- Fitness: `pass` on SDK `0.0.0`
- When to start: Start here for authentication, SSO, identity governance, policy administration, or security-control surfaces.
- When not to start: Do not start here for content publishing, business CRM flows, or observability dashboards.
- Follow-up commands:
  - `pnpm run feature-sync:generate -- --pack <pack-id>`
  - `pnpm run feature-sync:check`
  - `pnpm run feature-sync:verify`
  - `pnpm run feature-sync:quality-validate` when the SDK/package changed

## Secondary examples

### ai-work-assistant

- Path: `docs/sync-pack/generated-packs/communication-ai-ml/ai-work-assistant`
- Category: `communication-ai-ml`
- Maturity: `secondary`
- Use this as a reference example when no golden pack matches your problem closely.

### document-publishing-flow

- Path: `docs/sync-pack/generated-packs/content-publishing/document-publishing-flow`
- Category: `content-publishing`
- Maturity: `secondary`
- Use this as a reference example when no golden pack matches your problem closely.

### internal-app-builder-sandbox

- Path: `docs/sync-pack/generated-packs/mini-developer/internal-app-builder-sandbox`
- Category: `mini-developer`
- Maturity: `secondary`
- Use this as a reference example when no golden pack matches your problem closely.

### knowledge-workflow-hub

- Path: `docs/sync-pack/generated-packs/productivity-utilities/knowledge-workflow-hub`
- Category: `productivity-utilities`
- Maturity: `secondary`
- Use this as a reference example when no golden pack matches your problem closely.
