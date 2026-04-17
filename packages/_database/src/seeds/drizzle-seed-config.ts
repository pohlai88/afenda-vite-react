/**
 * Central configuration for drizzle-seed (deterministic PRNG) + @faker-js/faker alignment.
 *
 * Official docs: https://orm.drizzle.team/docs/seed-overview
 */
export { getGeneratorsFunctions } from "drizzle-seed"
export { reset as drizzleReset, seed as drizzleSeed } from "drizzle-seed"

/** Generator API version — pin when upgrading drizzle-seed for stable outputs. */
export const DRIZZLE_SEED_GENERATOR_VERSION = "2" as const

/** Fixed PRNG seed for synthetic / volume modules (drizzle-seed `options.seed`). */
export const DRIZZLE_SYNTHETIC_PRNG_SEED = 42_4242

/** Match Faker to the same run for hybrid modules (call `faker.seed` before any Faker API). */
export const FAKER_SYNTHETIC_SEED = 42_4242

/** Default row count when using base `seed()` without refine `count` per table. */
export const DRIZZLE_SEED_DEFAULT_COUNT = 10
