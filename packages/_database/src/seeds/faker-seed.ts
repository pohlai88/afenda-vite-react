import { faker } from "@faker-js/faker"

import {
  FAKER_SYNTHETIC_SEED,
} from "./drizzle-seed-config"

export { FAKER_SYNTHETIC_SEED } from "./drizzle-seed-config"

/**
 * Pins @faker-js/faker for reproducible values (tests, volume seeds).
 * Pair with {@link DRIZZLE_SYNTHETIC_PRNG_SEED} when a module uses both libraries.
 */
export function seedFakerDeterministic(seed: number = FAKER_SYNTHETIC_SEED): void {
  faker.seed(seed)
}

/**
 * Runs `fn` with a fixed faker seed, then restores the previous seed (best-effort).
 */
export function withDeterministicFaker<T>(seed: number, fn: () => T): T {
  faker.seed(seed)
  return fn()
}
