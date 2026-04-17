import type { SeedEnvironment, SeedStage } from "./contract"

export type SeedPolicyFlags = {
  allowProductionFixtures: boolean
}

export type SeedPolicyValidation = {
  allowedStages: ReadonlySet<SeedStage>
  flags: SeedPolicyFlags
}

/**
 * Resolves seed environment for policy checks.
 * Prefer SEED_ENV when set; otherwise infer from CI / Vercel / NODE_ENV.
 */
export function resolveSeedEnvironment(): SeedEnvironment {
  const raw = process.env.SEED_ENV?.trim().toLowerCase()
  if (
    raw === "local" ||
    raw === "ci" ||
    raw === "preview" ||
    raw === "staging" ||
    raw === "production"
  ) {
    return raw
  }

  if (process.env.CI === "true") {
    return "ci"
  }

  const vercel = process.env.VERCEL_ENV
  if (vercel === "preview") {
    return "preview"
  }
  if (vercel === "production") {
    return "production"
  }

  const nodeEnv = process.env.NODE_ENV
  if (nodeEnv === "production") {
    return "production"
  }
  if (nodeEnv === "test") {
    return "ci"
  }

  return "local"
}

function allowTenantFixture(
  env: SeedEnvironment,
  flags: SeedPolicyFlags
): boolean {
  if (flags.allowProductionFixtures) {
    return true
  }
  return (
    env === "local" ||
    env === "ci" ||
    env === "preview" ||
    env === "staging"
  )
}

function allowVolume(env: SeedEnvironment): boolean {
  return env === "local" || env === "ci"
}

/**
 * Computes which stages may execute in this environment (before CLI stage filters).
 */
export function getAllowedStages(
  env: SeedEnvironment,
  flags: SeedPolicyFlags
): ReadonlySet<SeedStage> {
  const allowed = new Set<SeedStage>([
    "bootstrap",
    "reference",
    "backfill",
  ])

  if (allowTenantFixture(env, flags)) {
    allowed.add("tenant-fixture")
  }

  if (allowVolume(env)) {
    allowed.add("volume")
  }

  return allowed
}

export function assertEnvironmentPolicy(
  env: SeedEnvironment,
  flags: SeedPolicyFlags
): SeedPolicyValidation {
  return {
    allowedStages: getAllowedStages(env, flags),
    flags,
  }
}

export type StageGateError = {
  stage: SeedStage
  environment: SeedEnvironment
  message: string
}

/**
 * Returns an error if this stage is never allowed in the current environment.
 */
export function checkStageAllowedForEnvironment(
  stage: SeedStage,
  env: SeedEnvironment,
  flags: SeedPolicyFlags
): StageGateError | undefined {
  const allowed = getAllowedStages(env, flags)
  if (allowed.has(stage)) {
    return undefined
  }

  if (stage === "tenant-fixture") {
    return {
      stage,
      environment: env,
      message:
        "tenant-fixture seeds are not allowed in this environment unless SEED_ALLOW_PRODUCTION_FIXTURES=true or --allow-production-fixtures",
    }
  }

  if (stage === "volume") {
    return {
      stage,
      environment: env,
      message:
        "volume seeds are only allowed in local or ci environments",
    }
  }

  return {
    stage,
    environment: env,
    message: `stage ${stage} is not allowed in environment ${env}`,
  }
}

/**
 * When the user explicitly requests a stage (CLI), fail hard if policy forbids it.
 */
export function assertExplicitStageRunnable(
  stage: SeedStage,
  env: SeedEnvironment,
  flags: SeedPolicyFlags
): void {
  const err = checkStageAllowedForEnvironment(stage, env, flags)
  if (err) {
    throw new Error(`[seed-policy] ${err.message}`)
  }
}

export function resolvePolicyFlagsFromEnv(): SeedPolicyFlags {
  const allowProductionFixtures =
    process.env.SEED_ALLOW_PRODUCTION_FIXTURES === "true" ||
    process.env.SEED_ALLOW_PRODUCTION_FIXTURES === "1"

  return { allowProductionFixtures }
}
