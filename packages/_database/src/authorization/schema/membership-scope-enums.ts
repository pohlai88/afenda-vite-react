import { pgEnum } from "drizzle-orm/pg-core"

/** Polymorphic scope discriminator; `scope_id` targets the table implied by this value. */
export const membershipScopeTypeEnum = pgEnum("membership_scope_type", [
  "tenant",
  "legal_entity",
  "business_unit",
  "location",
  "org_unit",
])

export const membershipScopeAccessModeEnum = pgEnum(
  "membership_scope_access_mode",
  ["include", "exclude"]
)

export const rolePermissionEffectEnum = pgEnum("role_permission_effect", [
  "allow",
  "deny",
])

export const tenantMembershipTypeEnum = pgEnum("tenant_membership_type", [
  "internal",
  "external",
  "service",
  "partner",
])
