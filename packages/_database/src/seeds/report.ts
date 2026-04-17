import { mkdir, writeFile } from "node:fs/promises"
import { dirname } from "node:path"

import type { SeedModuleReportEntry, SeedRunReport } from "./contract"

export function createSeedRunReportInit(params: {
  runId: string
  startedAt: string
  environment: string
  databaseTarget: string
}): SeedRunReport {
  return {
    runId: params.runId,
    startedAt: params.startedAt,
    finishedAt: "",
    environment: params.environment,
    databaseTarget: params.databaseTarget,
    modules: [],
  }
}

export function finalizeSeedRunReport(
  report: SeedRunReport,
  modules: SeedModuleReportEntry[],
  finishedAt: string
): SeedRunReport {
  return {
    ...report,
    finishedAt,
    modules,
  }
}

export function printSeedRunReport(report: SeedRunReport): void {
  const lines = [
    `[seed] runId=${report.runId}`,
    `[seed] environment=${report.environment}`,
    `[seed] databaseTarget=${report.databaseTarget}`,
    `[seed] startedAt=${report.startedAt}`,
    `[seed] finishedAt=${report.finishedAt}`,
    `[seed] modules:`,
  ]

  for (const m of report.modules) {
    const parts = [
      `  - ${m.key}`,
      `stage=${m.stage}`,
      `status=${m.status}`,
    ]
    if (m.inserted !== undefined) {
      parts.push(`inserted=${m.inserted}`)
    }
    if (m.updated !== undefined) {
      parts.push(`updated=${m.updated}`)
    }
    if (m.skippedReason) {
      parts.push(`skipped=${m.skippedReason}`)
    }
    if (m.error) {
      parts.push(`error=${m.error}`)
    }
    lines.push(parts.join(" "))
  }

  console.log(lines.join("\n"))
}

export async function writeSeedReportJson(
  report: SeedRunReport,
  filePath: string
): Promise<void> {
  await mkdir(dirname(filePath), { recursive: true })
  await writeFile(filePath, `${JSON.stringify(report, null, 2)}\n`, "utf8")
}
