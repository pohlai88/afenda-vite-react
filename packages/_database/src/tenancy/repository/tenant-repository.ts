import { and, eq } from "drizzle-orm"

import { db, type DatabaseClient } from "../../client"
import { users } from "../../identity/schema/users.schema"
import { tenantMemberships } from "../schema/tenant-memberships.schema"
import { tenants } from "../schema/tenants.schema"
import { requireTenantId } from "../policy/tenant-scope"

export async function findTenantBySlug(
  slug: string,
  client: DatabaseClient = db
) {
  const [tenant] = await client
    .select()
    .from(tenants)
    .where(eq(tenants.slug, slug))
    .limit(1)

  return tenant ?? null
}

export async function findActiveTenantMembership(
  userId: string,
  tenantId: string,
  client: DatabaseClient = db
) {
  const scopedTenantId = requireTenantId(tenantId)

  const [membership] = await client
    .select({
      membership: tenantMemberships,
      user: users,
    })
    .from(tenantMemberships)
    .innerJoin(users, eq(users.id, tenantMemberships.userId))
    .where(
      and(
        eq(tenantMemberships.tenantId, scopedTenantId),
        eq(tenantMemberships.userId, userId),
        eq(tenantMemberships.status, "active")
      )
    )
    .limit(1)

  return membership ?? null
}
