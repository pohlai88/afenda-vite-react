/**
 * Better Auth runtime singleton for `apps/api`.
 * Owns the shared Postgres pool and Better Auth instance so Hono routes and middleware use one
 * session authority. Tests can override the runtime to avoid live DB/auth dependencies.
 *
 * @module lib/better-auth-runtime
 * @package @afenda/api
 */
import {
  createAfendaAuth,
  type AfendaAuth,
  type AfendaAuthCapabilityHooks,
  resolveAfendaAuthCapabilityHooks,
  setSessionOperatingContext,
  type SetSessionOperatingContextResult,
} from "@afenda/better-auth"
import {
  createDbClient,
  createPgPool,
  listAfendaTenantCandidatesFromBetterAuthUserId,
  type AfendaTenantCandidateList,
  type DatabaseClient,
} from "@afenda/database"

import type { SessionContext } from "../contract/request-context.js"
import { assertBetterAuthRuntimeEnv } from "./env.js"

export interface BetterAuthCommandAuthority {
  readonly roles: readonly string[]
  readonly permissions: readonly string[]
}

export interface BetterAuthRuntime {
  readonly auth: AfendaAuth
  readonly db: DatabaseClient
  readonly capabilityHooks: AfendaAuthCapabilityHooks
  readonly resolveCommandAuthority?: (input: {
    session: SessionContext
    tenantId: string
    actorLabel: string
    requestId?: string
  }) => Promise<BetterAuthCommandAuthority>
  readonly listTenantCandidates: (input: {
    headers: Headers
  }) => Promise<AfendaTenantCandidateList>
  readonly activateTenantContext: (input: {
    headers: Headers
    activeTenantId?: string | null
  }) => Promise<SetSessionOperatingContextResult>
}

type BetterAuthRuntimeState = BetterAuthRuntime & {
  readonly close: () => Promise<void>
}

let betterAuthRuntimeState: BetterAuthRuntimeState | null = null
let betterAuthRuntimeOverride: BetterAuthRuntime | null = null

function createBetterAuthRuntimeState(): BetterAuthRuntimeState {
  assertBetterAuthRuntimeEnv()

  const pool = createPgPool()
  const db = createDbClient(pool)
  const auth = createAfendaAuth(pool, db)
  const capabilityHooks = resolveAfendaAuthCapabilityHooks()

  return {
    auth,
    db,
    capabilityHooks,
    listTenantCandidates: async ({ headers }) => {
      const session = await auth.api.getSession({
        headers,
        query: {
          disableRefresh: true,
        },
      })

      if (!session) {
        throw new Error("listTenantCandidates: unauthenticated")
      }

      return listAfendaTenantCandidatesFromBetterAuthUserId(db, session.user.id)
    },
    activateTenantContext: ({ headers, activeTenantId }) =>
      setSessionOperatingContext(auth, db, { headers, activeTenantId }),
    close: async () => {
      await pool.end()
    },
  }
}

export function getBetterAuthRuntime(): BetterAuthRuntime {
  if (betterAuthRuntimeOverride) {
    return betterAuthRuntimeOverride
  }

  if (!betterAuthRuntimeState) {
    betterAuthRuntimeState = createBetterAuthRuntimeState()
  }

  return betterAuthRuntimeState
}

export function setBetterAuthRuntimeForTests(
  runtime: BetterAuthRuntime | null
): void {
  betterAuthRuntimeOverride = runtime
}

export async function resetBetterAuthRuntimeForTests(): Promise<void> {
  betterAuthRuntimeOverride = null

  if (betterAuthRuntimeState) {
    await betterAuthRuntimeState.close()
    betterAuthRuntimeState = null
  }
}
