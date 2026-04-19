/**
 * Request + session context shapes for headers or JSON metadata from the API.
 * Aligns with the monorepo pack’s `requestContextSchema` / `sessionContextSchema`.
 * platform · http · api-client · request-context
 * Upstream: `zod`, `./web-envelope` (`webRequestIdSchema`), `./web-user` (`webUserIdSchema`).
 * Coupling: if `@afenda/api` exposes this on the wire, keep fields identical.
 * stable
 * @module api-client/web-request-context
 * @package @afenda/web
 */
import { z } from "zod"

import { webRequestIdSchema } from "./web-envelope"
import { webUserIdSchema } from "./web-user"

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
