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
  resolveAfendaAuthCapabilityHooks,
  setSessionOperatingContext,
  type AfendaAuth,
  type AfendaAuthCapabilityHooks,
  type SetSessionOperatingContextResult,
} from "@afenda/better-auth"
import { createDbClient, createPgPool } from "@afenda/database"

import { assertBetterAuthRuntimeEnv } from "./env.js"

export interface BetterAuthRuntime {
  readonly auth: AfendaAuth
  readonly capabilityHooks: AfendaAuthCapabilityHooks
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
    capabilityHooks,
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
