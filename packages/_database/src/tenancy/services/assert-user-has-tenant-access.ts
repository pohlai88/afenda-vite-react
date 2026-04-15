import type { DatabaseClient } from "../../client"

import { resolveAfendaMeContext } from "./resolve-afenda-me-context"

/** Returns whether the Afenda user for `email` has an active membership in `tenantId`. */
export async function assertUserHasTenantAccess(
  db: DatabaseClient,
  email: string | null | undefined,
  tenantId: string
): Promise<boolean> {
  const ctx = await resolveAfendaMeContext(db, email)
  if (!ctx) {
    return false
  }
  return ctx.tenantIds.includes(tenantId)
}
