import { zValidator } from "@hono/zod-validator"
import { Hono } from "hono"

import { success } from "../../../api-response.js"
import type { ApiEnv } from "../../../contract/request-context.contract.js"
import {
  ensureFinanceTenantContext,
  resolveFinanceAuthority,
} from "../finance-access.js"
import {
  financeAllocationViewPermission,
  financeAllocationWritePermission,
} from "./allocation.contract.js"
import {
  createAllocationInputSchema,
  financeAllocationListQuerySchema,
} from "./allocation.schema.js"
import {
  createFinanceAllocation,
  listFinanceAllocations,
} from "./allocation.service.js"

export const allocationRoutes = new Hono<ApiEnv>()
  .get(
    "/",
    zValidator("query", financeAllocationListQuerySchema),
    async (c) => {
      const tenantContext = ensureFinanceTenantContext(c)
      if (tenantContext instanceof Response) {
        return tenantContext
      }

      const authority = await resolveFinanceAuthority(c, tenantContext)
      if (!authority.permissions.includes(financeAllocationViewPermission)) {
        return c.json(
          {
            code: "FORBIDDEN",
            message:
              "The actor does not have permission to view finance allocations.",
          },
          403
        )
      }

      const query = c.req.valid("query")
      const result = await listFinanceAllocations({
        tenantId: tenantContext,
        query,
      })

      return c.json(success(result))
    }
  )
  .post("/", zValidator("json", createAllocationInputSchema), async (c) => {
    const tenantContext = ensureFinanceTenantContext(c)
    if (tenantContext instanceof Response) {
      return tenantContext
    }

    const authority = await resolveFinanceAuthority(c, tenantContext)
    if (!authority.permissions.includes(financeAllocationWritePermission)) {
      return c.json(
        {
          code: "FORBIDDEN",
          message:
            "The actor does not have permission to create finance allocations.",
        },
        403
      )
    }

    const payload = c.req.valid("json")
    const item = await createFinanceAllocation({
      tenantId: tenantContext,
      payload,
    })

    return c.json(
      success({
        tenantId: tenantContext,
        item,
      }),
      201
    )
  })
