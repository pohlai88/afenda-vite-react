import { eq } from "drizzle-orm"

import type { DatabaseClient } from "../../../client"
import { identityLinks } from "../../iam/identity-links.schema"

/**
 * Removes IAM bridge rows for a Better Auth user id before Better Auth deletes the auth user,
 * so `iam.identity_links` does not retain stale `better_auth_user_id` references.
 */
export async function deleteIdentityLinksForBetterAuthUser(
  db: DatabaseClient,
  betterAuthUserId: string
): Promise<void> {
  await db
    .delete(identityLinks)
    .where(eq(identityLinks.betterAuthUserId, betterAuthUserId))
}
