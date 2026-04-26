import { zValidator } from "@hono/zod-validator"
import { Hono } from "hono"

import { success } from "../../../api-response.js"
import type { ApiEnv } from "../../../contract/request-context.contract.js"
import {
  ensureFinanceTenantContext,
  resolveFinanceAuthority,
} from "../finance-access.js"
import {
  financeSettlementViewPermission,
  financeSettlementWritePermission,
} from "./settlement.contract.js"
import {
  createSettlementInputSchema,
  financeSettlementListQuerySchema,
} from "./settlement.schema.js"
import {
  createFinanceSettlement,
  listFinanceSettlements,
} from "./settlement.service.js"

export const settlementRoutes = new Hono<ApiEnv>()
  .get(
    "/",
    zValidator("query", financeSettlementListQuerySchema),
    async (c) => {
      const tenantContext = ensureFinanceTenantContext(c)
      if (tenantContext instanceof Response) {
        return tenantContext
      }

      const authority = await resolveFinanceAuthority(c, tenantContext)
      if (!authority.permissions.includes(financeSettlementViewPermission)) {
        return c.json(
          {
            code: "FORBIDDEN",
            message:
              "The actor does not have permission to view finance settlements.",
          },
          403
        )
      }

      const query = c.req.valid("query")
      const result = await listFinanceSettlements({
        tenantId: tenantContext,
        query,
      })

      return c.json(success(result))
    }
  )
  .post("/", zValidator("json", createSettlementInputSchema), async (c) => {
    const tenantContext = ensureFinanceTenantContext(c)
    if (tenantContext instanceof Response) {
      return tenantContext
    }

    const authority = await resolveFinanceAuthority(c, tenantContext)
    if (!authority.permissions.includes(financeSettlementWritePermission)) {
      return c.json(
        {
          code: "FORBIDDEN",
          message:
            "The actor does not have permission to create finance settlements.",
        },
        403
      )
    }

    const payload = c.req.valid("json")
    const item = await createFinanceSettlement({
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
