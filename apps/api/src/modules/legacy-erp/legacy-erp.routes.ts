/**
 * Legacy ERP adapter routes: internal transform and ingestion surface for stable legacy APIs.
 * Routes stay thin and admin-gated; service owns anti-corruption logic and owner handoff.
 * module · legacy-erp · routes
 * Upstream: hono, zod validator, authority resolution, adapter service.
 * Downstream: app composition, tests, future ingestion tooling.
 * Side effects: batch ingestion persists counterparties through the MDM boundary.
 * Coupling: emits normalized Afenda candidates and only persists entities with a live owner module.
 * experimental
 * @module modules/legacy-erp/legacy-erp.routes
 * @package @afenda/api
 */
import { zValidator } from "@hono/zod-validator"
import { Hono } from "hono"
import type { Context } from "hono"

import { getBetterAuthRuntime } from "../../api-auth-runtime.js"
import { hasBetterAuthRuntimeEnv } from "../../api-env.js"
import { success } from "../../api-response.js"
import { resolveActorAuthorityForTenant } from "../../command/execute-command.js"
import type { ApiEnv } from "../../contract/request-context.contract.js"
import { legacyErpTransformPermission } from "./legacy-erp.contract.js"
import {
  legacyErpCounterpartyPullRequestSchema,
  legacyErpIngestBatchRequestSchema,
  legacyErpItemPullRequestSchema,
  legacyErpTransformRequestSchema,
} from "./legacy-erp.schema.js"
import {
  pullLegacyCounterpartyBatch,
  pullLegacyItemBatch,
} from "./legacy-erp-source.service.js"
import {
  adaptLegacyErpPayload,
  ingestLegacyErpBatch,
} from "./legacy-erp.service.js"

function resolveTenantId(c: Context<ApiEnv>): string | null {
  const explicitHeader = c.req.header("x-tenant-id")?.trim()
  if (explicitHeader) {
    return explicitHeader
  }

  return c.get("session").tenantId
}

async function resolveBetterUser(
  c: Context<ApiEnv>
): Promise<
  { readonly name?: string | null; readonly email?: string | null } | undefined
> {
  if (!hasBetterAuthRuntimeEnv()) {
    return undefined
  }

  const runtime = getBetterAuthRuntime()
  const betterSession = await runtime.auth.api.getSession({
    headers: c.req.raw.headers,
    query: {
      disableRefresh: true,
    },
  })

  if (!betterSession) {
    return undefined
  }

  return {
    name: betterSession.user.name ?? null,
    email: betterSession.user.email ?? null,
  }
}

async function resolveLegacyAdapterAuthority(
  c: Context<ApiEnv>,
  tenantId: string
): Promise<{
  readonly roles: readonly string[]
  readonly permissions: readonly string[]
}> {
  const betterUser = await resolveBetterUser(c)

  return resolveActorAuthorityForTenant({
    session: c.get("session"),
    tenantId,
    actorLabel:
      betterUser?.name?.trim() ||
      betterUser?.email?.trim() ||
      c.get("session").userId ||
      "Afenda operator",
    requestId: c.get("requestId"),
  })
}

function ensureTenantContext(c: Context<ApiEnv>): string | Response {
  const tenantId = resolveTenantId(c)
  if (!tenantId) {
    return c.json(
      {
        code: "TENANT_CONTEXT_REQUIRED",
        message: "An active tenant context is required.",
      },
      409
    )
  }

  if (c.get("session").tenantId && tenantId !== c.get("session").tenantId) {
    return c.json(
      {
        code: "TENANT_CONTEXT_MISMATCH",
        message:
          "Legacy transforms must execute against the active tenant context on the current session.",
      },
      409
    )
  }

  return tenantId
}

export const legacyErpRoutes = new Hono<ApiEnv>()
  .use("*", async (c, next) => {
    const session = c.get("session")
    if (!session.authenticated) {
      return c.json(
        {
          code: "AUTH_REQUIRED",
          message: "Authentication is required.",
        },
        401
      )
    }

    await next()
  })
  .post(
    "/transform",
    zValidator("json", legacyErpTransformRequestSchema),
    async (c) => {
      const tenantContext = ensureTenantContext(c)
      if (tenantContext instanceof Response) {
        return tenantContext
      }

      const authority = await resolveLegacyAdapterAuthority(c, tenantContext)
      if (!authority.permissions.includes(legacyErpTransformPermission)) {
        return c.json(
          {
            code: "FORBIDDEN",
            message:
              "The actor does not have permission to transform legacy ERP payloads.",
          },
          403
        )
      }

      const request = c.req.valid("json")
      const adaptation = adaptLegacyErpPayload({
        tenantId: tenantContext,
        request,
      })

      return c.json(
        success({
          tenantId: tenantContext,
          adaptation,
        })
      )
    }
  )
  .post(
    "/ingest",
    zValidator("json", legacyErpIngestBatchRequestSchema),
    async (c) => {
      const tenantContext = ensureTenantContext(c)
      if (tenantContext instanceof Response) {
        return tenantContext
      }

      const authority = await resolveLegacyAdapterAuthority(c, tenantContext)
      if (!authority.permissions.includes(legacyErpTransformPermission)) {
        return c.json(
          {
            code: "FORBIDDEN",
            message:
              "The actor does not have permission to ingest legacy ERP payloads.",
          },
          403
        )
      }

      const request = c.req.valid("json")
      const ingestion = await ingestLegacyErpBatch({
        tenantId: tenantContext,
        request,
      })

      return c.json(
        success({
          tenantId: tenantContext,
          ingestion,
        })
      )
    }
  )
  .post(
    "/pull/counterparties",
    zValidator("json", legacyErpCounterpartyPullRequestSchema),
    async (c) => {
      const tenantContext = ensureTenantContext(c)
      if (tenantContext instanceof Response) {
        return tenantContext
      }

      const authority = await resolveLegacyAdapterAuthority(c, tenantContext)
      if (!authority.permissions.includes(legacyErpTransformPermission)) {
        return c.json(
          {
            code: "FORBIDDEN",
            message:
              "The actor does not have permission to pull legacy ERP payloads.",
          },
          403
        )
      }

      const request = c.req.valid("json")
      const pulledBatch = await pullLegacyCounterpartyBatch({
        request,
      })
      const ingestion = await ingestLegacyErpBatch({
        tenantId: tenantContext,
        request: {
          records: [...pulledBatch.records],
        },
      })

      return c.json(
        success({
          tenantId: tenantContext,
          pull: {
            sourceProfile: pulledBatch.sourceProfile,
            sourceSystem: pulledBatch.sourceSystem,
            fetchedCount: pulledBatch.fetchedCount,
            pagesFetched: pulledBatch.pagesFetched,
          },
          ingestion,
        })
      )
    }
  )
  .post(
    "/pull/items",
    zValidator("json", legacyErpItemPullRequestSchema),
    async (c) => {
      const tenantContext = ensureTenantContext(c)
      if (tenantContext instanceof Response) {
        return tenantContext
      }

      const authority = await resolveLegacyAdapterAuthority(c, tenantContext)
      if (!authority.permissions.includes(legacyErpTransformPermission)) {
        return c.json(
          {
            code: "FORBIDDEN",
            message:
              "The actor does not have permission to pull legacy ERP payloads.",
          },
          403
        )
      }

      const request = c.req.valid("json")
      const pulledBatch = await pullLegacyItemBatch({
        request,
      })
      const ingestion = await ingestLegacyErpBatch({
        tenantId: tenantContext,
        request: {
          records: [...pulledBatch.records],
        },
      })

      return c.json(
        success({
          tenantId: tenantContext,
          pull: {
            sourceProfile: pulledBatch.sourceProfile,
            sourceSystem: pulledBatch.sourceSystem,
            fetchedCount: pulledBatch.fetchedCount,
            pagesFetched: pulledBatch.pagesFetched,
          },
          ingestion,
        })
      )
    }
  )
