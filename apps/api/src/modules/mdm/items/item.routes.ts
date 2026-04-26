/**
 * Item routes: canonical API transport surface for the MDM item slice.
 * module · mdm · items · routes
 * Upstream: hono, zod validator, request context, MDM item service/contracts.
 * Downstream: mdm.routes, createApp().
 * Side effects: via service only.
 * Coupling: this is the API ownership root for item master-data writes and reads.
 * experimental
 * @module modules/mdm/items/item.routes
 * @package @afenda/api
 */
import { zValidator } from "@hono/zod-validator"
import { Hono } from "hono"
import type { Context } from "hono"

import { resolveActorAuthorityForTenant } from "../../../command/execute-command.js"
import type { ApiEnv } from "../../../contract/request-context.contract.js"
import { getBetterAuthRuntime } from "../../../api-auth-runtime.js"
import { hasBetterAuthRuntimeEnv } from "../../../api-env.js"
import { success } from "../../../api-response.js"
import { createItem, getItem, listItems } from "./item.service.js"
import {
  createItemInputSchema,
  itemIdParamSchema,
  itemListQuerySchema,
} from "./item.schema.js"
import {
  mdmItemViewPermission,
  mdmItemWritePermission,
} from "./item.contract.js"

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

async function resolveMdmAuthority(
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
          "Reads and writes must execute against the active tenant context on the current session.",
      },
      409
    )
  }

  return tenantId
}

export const itemRoutes = new Hono<ApiEnv>()
  .get("/", zValidator("query", itemListQuerySchema), async (c) => {
    const tenantContext = ensureTenantContext(c)
    if (tenantContext instanceof Response) {
      return tenantContext
    }

    const authority = await resolveMdmAuthority(c, tenantContext)
    if (!authority.permissions.includes(mdmItemViewPermission)) {
      return c.json(
        {
          code: "FORBIDDEN",
          message:
            "The actor does not have permission to view canonical items.",
        },
        403
      )
    }

    const query = c.req.valid("query")
    const items = await listItems({
      tenantId: tenantContext,
      query,
    })

    return c.json(
      success({
        tenantId: tenantContext,
        query,
        items,
      })
    )
  })
  .get("/:itemId", zValidator("param", itemIdParamSchema), async (c) => {
    const tenantContext = ensureTenantContext(c)
    if (tenantContext instanceof Response) {
      return tenantContext
    }

    const authority = await resolveMdmAuthority(c, tenantContext)
    if (!authority.permissions.includes(mdmItemViewPermission)) {
      return c.json(
        {
          code: "FORBIDDEN",
          message:
            "The actor does not have permission to view canonical items.",
        },
        403
      )
    }

    const { itemId } = c.req.valid("param")
    const item = await getItem({
      tenantId: tenantContext,
      itemId,
    })

    return c.json(
      success({
        tenantId: tenantContext,
        item,
      })
    )
  })
  .post("/", zValidator("json", createItemInputSchema), async (c) => {
    const tenantContext = ensureTenantContext(c)
    if (tenantContext instanceof Response) {
      return tenantContext
    }

    const authority = await resolveMdmAuthority(c, tenantContext)
    if (!authority.permissions.includes(mdmItemWritePermission)) {
      return c.json(
        {
          code: "FORBIDDEN",
          message:
            "The actor does not have permission to write canonical items.",
        },
        403
      )
    }

    const payload = c.req.valid("json")
    const item = await createItem({
      tenantId: tenantContext,
      payload,
    })

    return c.json(
      success({
        tenantId: tenantContext,
        createdFrom: payload,
        item,
      }),
      201
    )
  })
