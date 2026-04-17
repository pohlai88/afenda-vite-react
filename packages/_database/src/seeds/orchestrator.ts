import { randomUUID } from "node:crypto"

import type {
  SeedContext,
  SeedModule,
  SeedModuleReportEntry,
  SeedRunReport,
  SeedStage,
} from "./contract"
import {
  checkStageAllowedForEnvironment,
  resolvePolicyFlagsFromEnv,
  type SeedPolicyFlags,
} from "./policy"
import {
  createSeedRunReportInit,
  finalizeSeedRunReport,
  printSeedRunReport,
  writeSeedReportJson,
} from "./report"
import { maskDatabaseUrl } from "./url-mask"

export type RunSeedsOptions = {
  modules: SeedModule[]
  context: SeedContext
  stageFilter?: SeedStage | undefined
  moduleKey?: string | undefined
  policyFlags?: SeedPolicyFlags
  reportJsonPath?: string | undefined
}

/**
 * Tenant fixtures run before bootstrap so demo tenant rows exist before
 * tenant-scoped bootstrap seeds (e.g. roles).
 */
function stageRank(stage: SeedStage): number {
  const order: SeedStage[] = [
    "tenant-fixture",
    "reference",
    "bootstrap",
    "volume",
    "backfill",
  ]
  return order.indexOf(stage)
}

/**
 * Topological sort (Kahn) on a subgraph of modules.
 */
export function topologicalSortModules(modules: SeedModule[]): SeedModule[] {
  const inSet = new Set(modules.map((m) => m.key))
  const adj = new Map<string, string[]>()
  const indeg = new Map<string, number>()

  for (const m of modules) {
    indeg.set(m.key, 0)
    adj.set(m.key, [])
  }

  for (const m of modules) {
    for (const dep of m.dependsOn ?? []) {
      if (!inSet.has(dep)) {
        continue
      }
      adj.get(dep)!.push(m.key)
      indeg.set(m.key, (indeg.get(m.key) ?? 0) + 1)
    }
  }

  const queue = modules
    .filter((m) => (indeg.get(m.key) ?? 0) === 0)
    .sort((a, b) => {
      const s = stageRank(a.stage) - stageRank(b.stage)
      if (s !== 0) {
        return s
      }
      return a.key.localeCompare(b.key)
    })

  const result: SeedModule[] = []

  while (queue.length > 0) {
    const m = queue.shift()!
    result.push(m)
    for (const nextKey of adj.get(m.key) ?? []) {
      const next = modules.find((x) => x.key === nextKey)
      if (!next) {
        continue
      }
      const nextInd = (indeg.get(nextKey) ?? 0) - 1
      indeg.set(nextKey, nextInd)
      if (nextInd === 0) {
        queue.push(next)
        queue.sort((a, b) => {
          const s = stageRank(a.stage) - stageRank(b.stage)
          if (s !== 0) {
            return s
          }
          return a.key.localeCompare(b.key)
        })
      }
    }
  }

  if (result.length !== modules.length) {
    throw new Error(
      "[seed] cyclic dependency in seed modules (check dependsOn graph)"
    )
  }

  return result
}

export async function runSeeds(
  options: RunSeedsOptions
): Promise<SeedRunReport> {
  const { modules, context, stageFilter, moduleKey, reportJsonPath } = options

  const policyFlags = options.policyFlags ?? resolvePolicyFlagsFromEnv()
  const moduleByKey = new Map(modules.map((m) => [m.key, m]))

  for (const m of modules) {
    for (const dep of m.dependsOn ?? []) {
      if (!moduleByKey.has(dep)) {
        throw new Error(
          `[seed] module "${m.key}" depends on unknown module "${dep}"`
        )
      }
    }
  }

  let selected: SeedModule[]
  if (moduleKey) {
    const found = modules.filter((m) => m.key === moduleKey)
    if (found.length === 0) {
      throw new Error(`[seed] unknown module key: ${moduleKey}`)
    }
    selected = found
  } else if (stageFilter) {
    selected = modules.filter((m) => m.stage === stageFilter)
  } else {
    selected = [...modules]
  }

  const reportEntries: SeedModuleReportEntry[] = []
  const skippedKeys = new Set<string>()
  const active: SeedModule[] = []

  for (const m of selected) {
    const gate = checkStageAllowedForEnvironment(
      m.stage,
      context.environment,
      policyFlags
    )
    if (gate) {
      skippedKeys.add(m.key)
      reportEntries.push({
        key: m.key,
        stage: m.stage,
        status: "skipped",
        skippedReason: gate.message,
      })
    } else {
      active.push(m)
    }
  }

  const selectedKeys = new Set(selected.map((m) => m.key))
  const activeKeys = new Set(active.map((m) => m.key))

  for (const m of active) {
    for (const dep of m.dependsOn ?? []) {
      if (!selectedKeys.has(dep)) {
        throw new Error(
          `[seed] module "${m.key}" depends on "${dep}" which is not in the current selection (add stage or run full seed)`
        )
      }
      if (!activeKeys.has(dep) && !skippedKeys.has(dep)) {
        throw new Error(
          `[seed] module "${m.key}" depends on "${dep}" which is missing from the registry`
        )
      }
    }
  }

  const forTopo = active.map((m) => {
    const deps = (m.dependsOn ?? []).filter((d) => activeKeys.has(d))
    return {
      ...m,
      dependsOn: deps.length > 0 ? deps : undefined,
    }
  })

  const ordered = topologicalSortModules(forTopo)

  const startedAt = new Date().toISOString()
  const runId = randomUUID()
  const report = createSeedRunReportInit({
    runId,
    startedAt,
    environment: context.environment,
    databaseTarget: maskDatabaseUrl(process.env.DATABASE_URL),
  })

  const finalEntries: SeedModuleReportEntry[] = [...reportEntries]

  for (const m of ordered) {
    if (context.dryRun) {
      finalEntries.push({
        key: m.key,
        stage: m.stage,
        status: "executed",
        skippedReason: "dry-run",
      })
      continue
    }

    try {
      const result = await m.run(context)
      finalEntries.push({
        key: m.key,
        stage: m.stage,
        status: "executed",
        inserted: result?.inserted,
        updated: result?.updated,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      finalEntries.push({
        key: m.key,
        stage: m.stage,
        status: "failed",
        error: message,
      })
      const finishedAt = new Date().toISOString()
      const failedReport = finalizeSeedRunReport(
        report,
        finalEntries,
        finishedAt
      )
      printSeedRunReport(failedReport)
      if (reportJsonPath) {
        await writeSeedReportJson(failedReport, reportJsonPath)
      }
      throw error
    }
  }

  const finishedAt = new Date().toISOString()
  const complete = finalizeSeedRunReport(report, finalEntries, finishedAt)
  printSeedRunReport(complete)
  if (reportJsonPath) {
    await writeSeedReportJson(complete, reportJsonPath)
  }
  return complete
}
