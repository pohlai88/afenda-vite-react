import { Hono } from "hono"

import type { ApiEnv } from "../../contract/request-context.contract.js"

import { allocationRoutes } from "./allocations/allocation.routes.js"
import { invoiceRoutes } from "./invoices/invoice.routes.js"
import { settlementRoutes } from "./settlements/settlement.routes.js"

export const financeRoutes = new Hono<ApiEnv>()
  .route("/invoices", invoiceRoutes)
  .route("/allocations", allocationRoutes)
  .route("/settlements", settlementRoutes)
