import type { DatabaseClient } from "../client"

export type SeedEnvironment =
  | "local"
  | "ci"
  | "preview"
  | "staging"
  | "production"

export type SeedStage =
  | "bootstrap"
  | "reference"
  | "tenant-fixture"
  | "volume"
  | "backfill"

export type SeedContext = {
  db: DatabaseClient
  now: Date
  environment: SeedEnvironment
  tenantScope?: string[]
  dryRun: boolean
}

export type SeedModuleRunResult = {
  inserted?: number
  updated?: number
}

export type SeedModule = {
  key: string
  description: string
  stage: SeedStage
  safeInProduction: boolean
  dependsOn?: string[]
  run: (context: SeedContext) => Promise<SeedModuleRunResult | void>
}

export type SeedModuleReportEntry = {
  key: string
  stage: SeedStage
  status: "executed" | "skipped" | "failed"
  inserted?: number
  updated?: number
  skippedReason?: string
  error?: string
}

export type SeedRunReport = {
  runId: string
  startedAt: string
  finishedAt: string
  environment: string
  databaseTarget: string
  modules: SeedModuleReportEntry[]
}
