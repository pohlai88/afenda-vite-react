import { pgEnum } from "drizzle-orm/pg-core"

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

export const auditOutcomeEnum = pgEnum("audit_outcome", [
  "success",
  "rejected",
  "failed",
  "partial",
])

export const auditSourceChannelEnum = pgEnum("audit_source_channel", [
  "ui",
  "api",
  "workflow",
  "job",
  "import",
  "replay",
  "system",
])

export const deploymentEnvironmentEnum = pgEnum("deployment_environment", [
  "production",
  "prod",
  "staging",
  "sandbox",
  "dev",
])
