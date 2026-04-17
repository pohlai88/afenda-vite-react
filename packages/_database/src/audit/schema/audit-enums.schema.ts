import { pgEnum } from "drizzle-orm/pg-core"

/** Denormalized risk from the action catalog (`audit-action-catalog`). */
export const auditRiskLevelEnum = pgEnum("audit_risk_level", [
  "low",
  "medium",
  "high",
  "critical",
])

/** Who performed the action (nullable FK alone is not enough for forensics). */
export const auditActorTypeEnum = pgEnum("audit_actor_type", [
  "person",
  "service",
  "system",
  "integration",
  "scheduler",
  "migration",
  "policy_engine",
  "ai",
  "unknown",
])

/** Result of the audited operation. */
export const auditOutcomeEnum = pgEnum("audit_outcome", [
  "success",
  "rejected",
  "failed",
  "partial",
])

/** How the action entered the system. */
export const auditSourceChannelEnum = pgEnum("audit_source_channel", [
  "ui",
  "api",
  "workflow",
  "job",
  "import",
  "replay",
  "system",
])

/**
 * Deployment slice when audit spans environments.
 * Includes `production` as an alias used by some deployments alongside `prod`.
 */
export const deploymentEnvironmentEnum = pgEnum("deployment_environment", [
  "production",
  "prod",
  "staging",
  "sandbox",
  "dev",
])
