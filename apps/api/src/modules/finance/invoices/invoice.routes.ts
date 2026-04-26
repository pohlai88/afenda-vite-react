import { zValidator } from "@hono/zod-validator"
import { Hono } from "hono"

import type { ApiEnv } from "../../../contract/request-context.contract.js"
import { success } from "../../../api-response.js"
import {
  ensureFinanceTenantContext,
  resolveFinanceAuthority,
} from "../finance-access.js"
import {
  financeInvoiceViewPermission,
  financeInvoiceWritePermission,
  type FinanceInvoiceTransition,
} from "./invoice.contract.js"
import {
  createInvoiceInputSchema,
  financeInvoiceIdParamSchema,
  financeInvoiceListQuerySchema,
} from "./invoice.schema.js"
import {
  createFinanceInvoice,
  FinanceInvoiceLifecycleError,
  FinanceInvoiceNotFoundError,
  getFinanceInvoiceDetail,
  listFinanceInvoices,
  transitionFinanceInvoiceStatus,
} from "./invoice.service.js"

function buildNotFoundResponse(
  c: {
    json: (body: { code: string; message: string }, status: 404) => Response
  },
  error: FinanceInvoiceNotFoundError
): Response {
  return c.json(
    {
      code: "NOT_FOUND",
      message: error.message,
    },
    404
  )
}

function buildConflictResponse(
  c: {
    json: (body: { code: string; message: string }, status: 409) => Response
  },
  error: FinanceInvoiceLifecycleError
): Response {
  return c.json(
    {
      code: "CONFLICT",
      message: error.message,
    },
    409
  )
}

export const invoiceRoutes = new Hono<ApiEnv>()

invoiceRoutes.get(
  "/",
  zValidator("query", financeInvoiceListQuerySchema),
  async (c) => {
    const tenantContext = ensureFinanceTenantContext(c)
    if (tenantContext instanceof Response) {
      return tenantContext
    }

    const authority = await resolveFinanceAuthority(c, tenantContext)
    if (!authority.permissions.includes(financeInvoiceViewPermission)) {
      return c.json(
        {
          code: "FORBIDDEN",
          message:
            "The actor does not have permission to view finance invoices.",
        },
        403
      )
    }

    const query = c.req.valid("query")
    const result = await listFinanceInvoices({
      tenantId: tenantContext,
      query,
    })

    return c.json(success(result))
  }
)

invoiceRoutes.post(
  "/",
  zValidator("json", createInvoiceInputSchema),
  async (c) => {
    const tenantContext = ensureFinanceTenantContext(c)
    if (tenantContext instanceof Response) {
      return tenantContext
    }

    const authority = await resolveFinanceAuthority(c, tenantContext)
    if (!authority.permissions.includes(financeInvoiceWritePermission)) {
      return c.json(
        {
          code: "FORBIDDEN",
          message:
            "The actor does not have permission to create finance invoices.",
        },
        403
      )
    }

    const payload = c.req.valid("json")
    const item = await createFinanceInvoice({
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
  }
)

invoiceRoutes.get(
  "/:invoiceId",
  zValidator("param", financeInvoiceIdParamSchema),
  async (c) => {
    const tenantContext = ensureFinanceTenantContext(c)
    if (tenantContext instanceof Response) {
      return tenantContext
    }

    const authority = await resolveFinanceAuthority(c, tenantContext)
    if (!authority.permissions.includes(financeInvoiceViewPermission)) {
      return c.json(
        {
          code: "FORBIDDEN",
          message:
            "The actor does not have permission to view finance invoices.",
        },
        403
      )
    }

    const { invoiceId } = c.req.valid("param")

    try {
      const item = await getFinanceInvoiceDetail({
        tenantId: tenantContext,
        invoiceId,
      })

      return c.json(
        success({
          tenantId: tenantContext,
          item,
        })
      )
    } catch (error) {
      if (error instanceof FinanceInvoiceNotFoundError) {
        return buildNotFoundResponse(c, error)
      }

      throw error
    }
  }
)

function registerTransitionRoute(
  path: string,
  transition: FinanceInvoiceTransition
): void {
  invoiceRoutes.post(
    path,
    zValidator("param", financeInvoiceIdParamSchema),
    async (c) => {
      const tenantContext = ensureFinanceTenantContext(c)
      if (tenantContext instanceof Response) {
        return tenantContext
      }

      const authority = await resolveFinanceAuthority(c, tenantContext)
      if (!authority.permissions.includes(financeInvoiceWritePermission)) {
        return c.json(
          {
            code: "FORBIDDEN",
            message:
              "The actor does not have permission to update finance invoices.",
          },
          403
        )
      }

      const { invoiceId } = c.req.valid("param")

      try {
        const item = await transitionFinanceInvoiceStatus({
          tenantId: tenantContext,
          invoiceId,
          transition,
        })

        return c.json(
          success({
            tenantId: tenantContext,
            item,
          })
        )
      } catch (error) {
        if (error instanceof FinanceInvoiceNotFoundError) {
          return buildNotFoundResponse(c, error)
        }

        if (error instanceof FinanceInvoiceLifecycleError) {
          return buildConflictResponse(c, error)
        }

        throw error
      }
    }
  )
}

registerTransitionRoute("/:invoiceId/open", "open")
registerTransitionRoute("/:invoiceId/paid", "paid")
registerTransitionRoute("/:invoiceId/void", "void")
