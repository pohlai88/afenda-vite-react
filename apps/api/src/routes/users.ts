/**
 * User routes: thin edge layer; validation at transport boundary; service owns business rules.
 * Mounted at `/api/users` — paths here are `/` relative to that prefix.
 * module · http · routes · users
 * Upstream: hono, @hono/zod-validator, `../contract/user`, `../lib/response`, user.service.
 * Downstream: `createApp()` mounts at `/api/users`.
 * Side effects: via user.service only.
 * Coupling: Zod validation uses default `@hono/zod-validator` response on failure (typically 400).
 * experimental
 * @module routes/users
 * @package @afenda/api
 */
import { createUserInputSchema } from "../contract/user.js"
import { success } from "../lib/response.js"
import { zValidator } from "@hono/zod-validator"
import { Hono } from "hono"

import { createUser, listUsers } from "../modules/users/user.service.js"

export const userRoutes = new Hono()

userRoutes.get("/", async (c) => {
  const users = await listUsers()
  return c.json(success(users))
})

userRoutes.post("/", zValidator("json", createUserInputSchema), async (c) => {
  const input = c.req.valid("json")
  const user = await createUser(input)
  return c.json(success(user), 201)
})
