import { pgEnum } from "drizzle-orm/pg-core"

export const tenantStatus = pgEnum("tenant_status", [
  "active",
  "suspended",
  "archived",
])

export const tenantMembershipStatus = pgEnum("tenant_membership_status", [
  "invited",
  "active",
  "suspended",
  "left",
  /** Ended by admin/policy; distinct from voluntary `left`. */
  "revoked",
])

export const tenantMembershipTypeEnum = pgEnum("tenant_membership_type", [
  "internal",
  "external",
  "service",
])
