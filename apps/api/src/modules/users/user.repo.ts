/**
 * User repository: baseline in-memory `Map`; swap for Drizzle/Postgres without route changes.
 * Owns persistence shape only; business rules stay in `user.service.ts`.
 * module · users · repository
 * Upstream: user.schema types. Downstream: user.service.
 * Side effects: mutates in-memory `Map`; no I/O.
 * Coupling: keys are user `id`; email uniqueness enforced in service layer.
 * experimental
 * @module modules/users/user.repo
 * @package @afenda/api
 */
import type { CreateUserInput, User } from "./user.schema.js"

export interface UserRepository {
  findAll(): Promise<User[]>
  findByEmail(email: string): Promise<User | null>
  insert(input: CreateUserInput): Promise<User>
}

class InMemoryUserRepository implements UserRepository {
  private readonly users = new Map<string, User>()

  async findAll(): Promise<User[]> {
    return Array.from(this.users.values())
  }

  async findByEmail(email: string): Promise<User | null> {
    const normalized = email.trim().toLowerCase()
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === normalized) return user
    }
    return null
  }

  async insert(input: CreateUserInput): Promise<User> {
    const user: User = {
      id: crypto.randomUUID(),
      email: input.email,
      name: input.name,
    }

    this.users.set(user.id, user)
    return user
  }

  /** Clears the in-memory store. Used by `__resetUserRepoForTests` only. */
  clearForTests(): void {
    this.users.clear()
  }
}

const inMemoryUserRepository = new InMemoryUserRepository()

export const userRepository: UserRepository = inMemoryUserRepository

/** Clears the in-memory store. Intended for Vitest `beforeEach` only. */
export function __resetUserRepoForTests(): void {
  inMemoryUserRepository.clearForTests()
}
