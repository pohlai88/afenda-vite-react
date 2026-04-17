import { and, eq, sql } from "drizzle-orm"

import type { DatabaseClient } from "../../client"
import { identityLinks } from "../schema/identity-links.schema"
import { users } from "../schema/users.schema"

export type EnsureIdentityLinkResult = {
  afendaUserId: string
  createdLink: boolean
  createdUser: boolean
}

/**
 * Bootstrap: for a Better Auth user, ensure an Afenda `users` row and `identity_links` row exist.
 * Empty-DB posture — no email-based resolution path; the bridge is created at first sign-up.
 */
export async function ensureIdentityLinkForBetterAuthUser(
  db: DatabaseClient,
  input: {
    betterAuthUserId: string
    email: string
    authProvider?: string
  }
): Promise<EnsureIdentityLinkResult> {
  const authProvider = input.authProvider ?? "better-auth"
  const normalizedEmail = input.email.trim().toLowerCase()

  const [existing] = await db
    .select({ afendaUserId: identityLinks.afendaUserId })
    .from(identityLinks)
    .where(
      and(
        eq(identityLinks.authProvider, authProvider),
        eq(identityLinks.betterAuthUserId, input.betterAuthUserId)
      )
    )
    .limit(1)

  if (existing) {
    return {
      afendaUserId: existing.afendaUserId,
      createdLink: false,
      createdUser: false,
    }
  }

  const [byEmail] = await db
    .select({ id: users.id })
    .from(users)
    .where(sql`lower(${users.email}) = ${normalizedEmail}`)
    .limit(1)

  let afendaUserId: string
  let createdUser = false

  if (byEmail) {
    afendaUserId = byEmail.id
  } else {
    const [inserted] = await db
      .insert(users)
      .values({
        email: normalizedEmail,
      })
      .returning({ id: users.id })
    if (!inserted) {
      throw new Error("Failed to create Afenda user for identity bootstrap.")
    }
    afendaUserId = inserted.id
    createdUser = true
  }

  await db.insert(identityLinks).values({
    afendaUserId,
    authProvider,
    betterAuthUserId: input.betterAuthUserId,
    authEmail: normalizedEmail,
  })

  return {
    afendaUserId,
    createdLink: true,
    createdUser,
  }
}
