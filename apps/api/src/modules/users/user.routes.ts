/**
 * User routes: thin edge layer; validation at transport boundary; service owns business rules.
 * Mounted at `/api/users` — paths here are `/` relative to that prefix.
 * module · http · routes · users
 * Upstream: hono, @hono/zod-validator, `../../contract/user.contract`, `../../api-response`, user.service.
 * Downstream: `createApp()` mounts at `/api/users`.
 * Side effects: via user.service only.
 * Coupling: Zod validation uses default `@hono/zod-validator` response on failure (typically 400).
 * experimental
 * @module modules/users/user.routes
 * @package @afenda/api
 */
import { createUserInputSchema } from "../../contract/user.contract.js"
import { success } from "../../api-response.js"
import { createUser, listUsers } from "./index.js"
import { zValidator } from "@hono/zod-validator"
import { Hono } from "hono"

export const userRoutes = new Hono()
  .get("/", async (c) => {
    const users = await listUsers()
    return c.json(success(users))
  })
  .post("/", zValidator("json", createUserInputSchema), async (c) => {
    const input = c.req.valid("json")
    const user = await createUser(input)
    return c.json(success(user), 201)
  })
