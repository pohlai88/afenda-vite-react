/**
 * Request + session context shapes for headers or JSON metadata from the API.
 * Aligns with the monorepo pack’s `requestContextSchema` / `sessionContextSchema`.
 * platform · http · rpc · request-context
 * Upstream: `zod`, `./web-envelope.contract` (`webRequestIdSchema`), `./web-user.contract` (`webUserIdSchema`).
 * Coupling: if `@afenda/api` exposes this on the wire, keep fields identical.
 * stable
 * @module rpc/web-request-context.contract
 * @package @afenda/web
 */
import { z } from "zod"

import { webRequestIdSchema } from "./web-envelope.contract"
import { webUserIdSchema } from "./web-user.contract"

export const webTenantIdSchema = z.string().uuid()
export const webMembershipIdSchema = z.string().uuid()

export const webSessionContextSchema = z.object({
  authenticated: z.boolean(),
  userId: webUserIdSchema.nullable(),
  membershipId: webMembershipIdSchema.nullable(),
  tenantId: webTenantIdSchema.nullable(),
})

export const webRequestContextSchema = z.object({
  requestId: webRequestIdSchema,
  path: z.string(),
  method: z.string(),
  session: webSessionContextSchema,
})

export type WebSessionContext = z.infer<typeof webSessionContextSchema>
export type WebRequestContext = z.infer<typeof webRequestContextSchema>
