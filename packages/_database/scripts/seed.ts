/**
 * Governed database seed CLI for @afenda/database.
 *
 * Usage (repo root):
 *   pnpm db:seed
 *   pnpm --filter @afenda/database exec tsx scripts/seed.ts --dry-run
 *   pnpm --filter @afenda/database exec tsx scripts/seed.ts --stage=bootstrap --tenant=<uuid>
 */
import { loadMonorepoEnvLayered } from "@afenda/env-loader"

import { closeDbPool, createDbClient, createPgPool } from "../src/client"
import type { SeedContext, SeedStage } from "../src/seeds/contract"
import { DEMO_TENANT_ID } from "../src/seeds/constants"
import {
  assertExplicitStageRunnable,
  resolvePolicyFlagsFromEnv,
  resolveSeedEnvironment,
} from "../src/seeds/policy"
import { runSeeds } from "../src/seeds/orchestrator"
import { allSeedModules } from "../src/seeds/registry"

function parseArgs(argv: string[]) {
  let dryRun = false
  let stage: SeedStage | undefined
  let moduleKey: string | undefined
  let tenant: string | undefined
  let allowProductionFixtures = false
  let reportJson: string | undefined

  for (const arg of argv) {
    if (arg === "--dry-run") {
      dryRun = true
      continue
    }
    if (arg === "--allow-production-fixtures") {
      allowProductionFixtures = true
      continue
    }
    if (arg.startsWith("--stage=")) {
      stage = arg.slice("--stage=".length) as SeedStage
      continue
    }
    if (arg.startsWith("--module=")) {
      moduleKey = arg.slice("--module=".length)
      continue
    }
    if (arg.startsWith("--tenant=")) {
      tenant = arg.slice("--tenant=".length).trim()
      continue
    }
    if (arg.startsWith("--report-json=")) {
      reportJson = arg.slice("--report-json=".length).trim()
      continue
    }
  }

  return {
    dryRun,
    stage,
    moduleKey,
    tenant,
    allowProductionFixtures,
    reportJson,
  }
}

loadMonorepoEnvLayered()

const args = parseArgs(process.argv.slice(2))

const url = process.env.DATABASE_URL
if (!url && !args.dryRun) {
  console.error(
    "[seed] DATABASE_URL is not set. Load .env / .env.neon or set the variable."
  )
  process.exit(1)
}
if (!url && args.dryRun) {
  process.env.DATABASE_URL =
    "postgresql://127.0.0.1:1/dry_run_placeholder"
}

const environment = resolveSeedEnvironment()
const policyFlags = {
  allowProductionFixtures:
    args.allowProductionFixtures ||
    resolvePolicyFlagsFromEnv().allowProductionFixtures,
}

if (args.stage) {
  assertExplicitStageRunnable(args.stage, environment, policyFlags)
}

const tenantScope =
  args.tenant !== undefined && args.tenant.length > 0
    ? [args.tenant]
    : environment === "local" ||
        environment === "ci" ||
        environment === "preview" ||
        environment === "staging"
      ? [DEMO_TENANT_ID]
      : undefined

async function probePostgres(pool: ReturnType<typeof createPgPool>) {
  const client = await pool.connect()
  try {
    await client.query("SELECT 1 as seed_connection_probe")
  } finally {
    client.release()
  }
}

async function main() {
  const pool = createPgPool()
  if (!args.dryRun) {
    try {
      await probePostgres(pool)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error(
        "[seed] PostgreSQL unreachable (Neon: check branch URL, pooler host, IP allow list, or cold start).",
        message
      )
      process.exit(1)
    }
  }
  const db = createDbClient(pool)

  const context: SeedContext = {
    db,
    now: new Date(),
    environment,
    tenantScope,
    dryRun: args.dryRun,
  }

  try {
    await runSeeds({
      modules: allSeedModules,
      context,
      stageFilter: args.stage,
      moduleKey: args.moduleKey,
      policyFlags,
      reportJsonPath: args.reportJson,
    })
  } finally {
    await closeDbPool(pool)
  }
}

main().catch((error) => {
  console.error("[seed] failed:", error instanceof Error ? error.message : error)
  process.exit(1)
})
