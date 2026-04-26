/**
 * User service: business rules live here; routes stay thin transport adapters.
 * Owns orchestration only; persistence via `user.repo.ts`.
 * module · users · service
 * Upstream: user.schema, user.repo, `conflict` from api-errors. Downstream: user.routes, tests.
 * Side effects: via repository only.
 * Coupling: duplicate email → `conflict()` (409).
 * experimental
 * @module modules/users/user.service
 * @package @afenda/api
 */
import { conflict } from "../../api-errors.js"
import type { CreateUserInput, User } from "./user.schema.js"
import { __resetUserRepoForTests, userRepository } from "./user.repo.js"

export async function listUsers(): Promise<User[]> {
  return userRepository.findAll()
}

export async function createUser(input: CreateUserInput): Promise<User> {
  const existing = await userRepository.findByEmail(input.email)

  if (existing) {
    throw conflict("A user with this email already exists.", {
      email: input.email,
    })
  }

  return userRepository.insert(input)
}

/** Clears the in-memory store. Intended for Vitest `beforeEach` only. */
export function __resetUsersForTests(): void {
  __resetUserRepoForTests()
}
