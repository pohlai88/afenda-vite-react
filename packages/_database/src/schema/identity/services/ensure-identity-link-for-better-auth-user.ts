/**
 * @afenda/database — server-only PostgreSQL + Drizzle persistence boundary for the Afenda monorepo.
 * Identity **service** (not DDL): resolves or creates `iam.identity_links` + `iam.user_accounts` for a Better Auth user id. Tables remain defined under `src/schema/iam/`. Migrations N/A for this file.
 * Import via package exports only (`@afenda/database`, …); do not deep-import `src/` from apps.
 * Not for browser bundles: uses Node pg Pool; `DATABASE_URL` and pool env are server-side secrets, never `VITE_*`.
 * Tenancy, audit append-only semantics, and FK patterns follow `docs/guideline/` (001-postgreSQL-DDL.md, 008-db-tree.md).
 * Schema or relation changes require `db:guard` / `db:ci`; Drizzle Kit output is gitignored until you generate/apply migrations.
 * Studio snapshots & glossary JSON describe intent; runtime truth is PostgreSQL plus migration history.
 * Envelope timestamp: 2026-04-18T12:00:00.000Z
 *
 * This module: `src/schema/identity/services/ensure-identity-link-for-better-auth-user.ts` — idempotent link bootstrap (lookup by provider + BA user id; else match/create `user_accounts` by email, then insert `identity_links`).
 */
import { and, eq, sql } from "drizzle-orm"

import type { DatabaseClient } from "../../../client"
import { identityLinks } from "../../iam/identity-links.schema"
import { userAccounts } from "../../iam/user-accounts.schema"

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
    const at = normalizedEmail.indexOf("@")
    const displayName =
      at > 0 ? normalizedEmail.slice(0, at) : normalizedEmail || "User"
    const [inserted] = await db
      .insert(userAccounts)
      .values({
        email: normalizedEmail,
        displayName,
        accountStatus: "active",
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
