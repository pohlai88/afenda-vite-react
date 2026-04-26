/**
 * User entity + create-input — shared by API routes and tests.
 * @module contract/user.contract
 */
import { z } from "zod"

export const userIdSchema = z.string().uuid()

export const userSchema = z.object({
  id: userIdSchema,
  email: z.string().email(),
  name: z.string().min(1).max(120),
})

export const createUserInputSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(120),
})

export type User = z.infer<typeof userSchema>
export type CreateUserInput = z.infer<typeof createUserInputSchema>
