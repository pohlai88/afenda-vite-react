/**
 * MDM routes: ownership-first API root for canonical master-data surfaces.
 * Domain routes mount here; operations may consume MDM projections but must not own master-data writes.
 * module · mdm · routes
 * Upstream: counterparties routes, request context types.
 * Downstream: createApp().
 * Side effects: via mounted ownership routes only.
 * Coupling: keeps MDM as its own API root rather than hiding canonical data under operations.
 * experimental
 * @module modules/mdm/mdm.routes
 * @package @afenda/api
 */
import { Hono } from "hono"

import type { ApiEnv } from "../../contract/request-context.contract.js"
import { counterpartyRoutes } from "./counterparties/counterparty.routes.js"
import { itemRoutes } from "./items/item.routes.js"

export const mdmRoutes = new Hono<ApiEnv>()
  .route("/counterparties", counterpartyRoutes)
  .route("/items", itemRoutes)
