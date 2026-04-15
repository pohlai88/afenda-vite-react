import { eq, sql } from "drizzle-orm"

import type { DatabaseClient } from "../../client"
import { tenantMemberships } from "../schema/tenant-memberships"
import { tenants } from "../schema/tenants"
import { users } from "../../identity/schema/users"

export type AfendaMeContext = {
  afendaUserId: string
  tenantIds: string[]
  defaultTenantId: string | null
}

/**
 * Resolves Afenda domain user + tenant memberships from Better Auth email (same as users.email).
 */
export async function resolveAfendaMeContext(
  db: DatabaseClient,
  email: string | null | undefined
): Promise<AfendaMeContext | null> {
  const normalized = email?.trim().toLowerCase()
  if (!normalized) return null

  const [row] = await db
    .select({ id: users.id })
    .from(users)
    .where(sql`lower(${users.email}) = ${normalized}`)
    .limit(1)

  if (!row) return null

  const memberships = await db
    .select({
      tenantId: tenantMemberships.tenantId,
      status: tenantMemberships.status,
      tenantStatus: tenants.status,
    })
    .from(tenantMemberships)
    .innerJoin(tenants, eq(tenantMemberships.tenantId, tenants.id))
    .where(eq(tenantMemberships.userId, row.id))

  const tenantIds = memberships
    .filter((m) => m.status === "active" && m.tenantStatus === "active")
    .map((m) => m.tenantId)

  return {
    afendaUserId: row.id,
    tenantIds,
    defaultTenantId: tenantIds[0] ?? null,
  }
}
