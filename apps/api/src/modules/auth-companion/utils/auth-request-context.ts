import type { AfendaAuth } from "@afenda/better-auth"
import { AsyncLocalStorage } from "node:async_hooks"

type AuthSession = NonNullable<
  Awaited<ReturnType<AfendaAuth["api"]["getSession"]>>
>

export interface AuthRequestContext {
  readonly requestId?: string
  readonly actorUserId: string | null
  readonly ipAddress: string | null
  readonly userAgent: string | null
}

/**
 * Adapt this to your HTTP framework / Better Auth session extraction.
 */
export function buildAuthRequestContext(input: {
  requestId?: string
  actorUserId?: string | null
  ipAddress?: string | null
  userAgent?: string | null
}): AuthRequestContext {
  return {
    requestId: input.requestId,
    actorUserId: input.actorUserId ?? null,
    ipAddress: input.ipAddress ?? null,
    userAgent: input.userAgent ?? null,
  }
}

/** Better Auth session + transport hints for demo session listing. */
export type AuthSessionRequestContext = {
  readonly session: AuthSession
  readonly userAgent: string
  readonly forwardedFor: string | null
}

const sessionAls = new AsyncLocalStorage<AuthSessionRequestContext>()

export function runWithAuthSessionContext<T>(
  ctx: AuthSessionRequestContext,
  fn: () => T
): T {
  return sessionAls.run(ctx, fn)
}

export function getAuthSessionRequestContext():
  | AuthSessionRequestContext
  | undefined {
  return sessionAls.getStore()
}
