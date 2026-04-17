import { and, eq, sql } from "drizzle-orm"

import type { DatabaseClient } from "../../client"
import { identityLinks } from "../../schema/iam/identity-links.schema"
import { userAccounts } from "../../schema/iam/user-accounts.schema"

export type EnsureIdentityLinkResult = {
  afendaUserId: string
  createdLink: boolean
  createdUser: boolean
}

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
    .select({ id: userAccounts.id })
    .from(userAccounts)
    .where(sql`lower(${userAccounts.email}) = ${normalizedEmail}`)
    .limit(1)

  let afendaUserId: string
  let createdUser = false

  if (byEmail) {
    afendaUserId = byEmail.id
  } else {
    const [inserted] = await db
      .insert(userAccounts)
      .values({
        email: normalizedEmail,
      })
      .returning({ id: userAccounts.id })
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
