/**
 * User entity + create-input and response envelope schemas for the SPA fetch layer.
 * platform · http · rpc · user
 * Upstream: `zod`. Downstream: `web-users`, forms, TanStack Query.
 * Coupling: keep schemas aligned with `apps/api/src/contract/user.ts`.
 * stable
 * @module rpc/web-user
 * @package @afenda/web
 */
import { z } from "zod"

export const webUserIdSchema = z.string().uuid()

export const webUserSchema = z.object({
  id: webUserIdSchema,
  email: z.string().email(),
  name: z.string().min(1).max(120),
})

export const webCreateUserInputSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(120),
})

export type WebUser = z.infer<typeof webUserSchema>
export type WebCreateUserInput = z.infer<typeof webCreateUserInputSchema>

/** `GET /api/users` → `c.json(success(users))` */
export const webListUsersSuccessEnvelopeSchema = z.object({
  ok: z.literal(true),
  data: z.array(webUserSchema),
  meta: z.record(z.string(), z.unknown()).optional(),
})

/** `POST /api/users` → `c.json(success(user), 201)` */
export const webCreateUserSuccessEnvelopeSchema = z.object({
  ok: z.literal(true),
  data: webUserSchema,
  meta: z.record(z.string(), z.unknown()).optional(),
})
