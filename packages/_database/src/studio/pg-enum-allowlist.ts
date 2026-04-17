/**
 * Allowlisted Postgres enum typnames for DB Studio read-only catalog.
 * Must match `pgEnum("name", [...])` names in Drizzle schema modules.
 */
export const STUDIO_PG_ENUM_ALLOWLIST: readonly string[] = [
  "tenant_status",
  "tenant_membership_status",
  "auth_challenge_method",
  "auth_challenge_status",
  "audit_risk_level",
  "audit_actor_type",
  "audit_outcome",
  "audit_source_channel",
  "deployment_environment",
]
