import fs from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { createApp } from "../../apps/api/src/app.js"
import { workspaceRoot } from "../config/afenda-config.js"
import { writeJsonFile } from "../lib/governance-spine.js"

export type ApiRouteSurfaceEntry = {
  readonly method: string
  readonly path: string
  readonly basePath: string
  readonly surface:
    | "root"
    | "health"
    | "auth"
    | "auth-v1"
    | "commands"
    | "me"
    | "ops"
    | "users"
    | "other"
}

export type ApiRouteSurfaceReport = {
  readonly generatedAt: string
  readonly sourceOfTruth: {
    readonly app: string
    readonly routes: readonly string[]
  }
  readonly summary: {
    readonly routeCount: number
    readonly uniqueMethods: readonly string[]
    readonly governedSurfaces: Readonly<Record<string, number>>
  }
  readonly routes: readonly ApiRouteSurfaceEntry[]
}

const jsonReportPath = path.join(
  workspaceRoot,
  ".artifacts/reports/governance/api-route-surface.report.json"
)
const markdownReportPath = path.join(
  workspaceRoot,
  "docs/architecture/governance/generated/api-route-surface.md"
)
const publicHttpMethods = new Set([
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "OPTIONS",
]) as ReadonlySet<string>

export function classifyApiRouteSurface(
  routePath: string
): ApiRouteSurfaceEntry["surface"] {
  if (routePath === "/") {
    return "root"
  }
  if (routePath === "/health") {
    return "health"
  }
  if (routePath.startsWith("/api/auth")) {
    return "auth"
  }
  if (routePath.startsWith("/api/v1/auth")) {
    return "auth-v1"
  }
  if (routePath.startsWith("/api/v1/commands")) {
    return "commands"
  }
  if (routePath.startsWith("/api/v1/me")) {
    return "me"
  }
  if (routePath.startsWith("/api/v1/ops")) {
    return "ops"
  }
  if (routePath.startsWith("/api/users")) {
    return "users"
  }

  return "other"
}

function compareRoutes(
  left: ApiRouteSurfaceEntry,
  right: ApiRouteSurfaceEntry
) {
  return (
    left.path.localeCompare(right.path) ||
    left.method.localeCompare(right.method) ||
    left.basePath.localeCompare(right.basePath)
  )
}

export function renderApiRouteSurfaceMarkdown(
  report: ApiRouteSurfaceReport
): string {
  const routeRows = renderMarkdownTable(
    ["Method", "Path", "Base path", "Surface"],
    report.routes.map((route) => [
      `\`${route.method}\``,
      `\`${route.path}\``,
      `\`${route.basePath}\``,
      `\`${route.surface}\``,
    ])
  )

  const surfaceRows = Object.entries(report.summary.governedSurfaces)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([surface, count]) => `- \`${surface}\`: ${String(count)} route(s)`)
    .join("\n")

  return `---
title: API route surface
description: Generated inventory of the live Hono route tree mounted by apps/api/src/app.ts.
status: generated
owner: web-api-architecture
truthStatus: supporting
docClass: supporting-doc
relatedDomain: api-contract
order: 999
---

# API route surface

This file is generated from \`apps/api/src/app.ts\` by \`scripts/governance/generate-api-route-surface.ts\`.
Use it as the route-inventory truth surface. [docs/API.md](../../../API.md) is the narrative companion.

- Generated at: \`${report.generatedAt}\`
- Route count: ${String(report.summary.routeCount)}
- Methods: ${report.summary.uniqueMethods.map((method) => `\`${method}\``).join(", ")}

## Surface summary

${surfaceRows}

## Mounted routes

${routeRows}
`
}

function renderMarkdownTable(
  headers: readonly string[],
  rows: readonly (readonly string[])[]
): string {
  const widths = headers.map((header, columnIndex) =>
    Math.max(header.length, ...rows.map((row) => row[columnIndex]?.length ?? 0))
  )

  const renderRow = (cells: readonly string[]) =>
    `| ${cells.map((cell, index) => cell.padEnd(widths[index] ?? 0)).join(" | ")} |`

  return [
    renderRow(headers),
    renderRow(widths.map((width) => "-".repeat(width))),
    ...rows.map(renderRow),
  ].join("\n")
}

export function renderApiRouteSurfaceReportJson(
  report: ApiRouteSurfaceReport
): string {
  return `${JSON.stringify(report, null, 2)}\n`
}

export function buildApiRouteSurfaceReport(
  generatedAt = new Date().toISOString()
): ApiRouteSurfaceReport {
  const app = createApp()
  const routes = [...app.routes]
    .map((route) => ({
      method: route.method.toUpperCase(),
      path: route.path,
      basePath: route.basePath,
      surface: classifyApiRouteSurface(route.path),
    }))
    .filter((route) => publicHttpMethods.has(route.method))
    .filter(
      (route, index, list): route is ApiRouteSurfaceEntry =>
        list.findIndex(
          (candidate) =>
            candidate.method === route.method &&
            candidate.path === route.path &&
            candidate.basePath === route.basePath
        ) === index
    )
    .sort(compareRoutes)

  return {
    generatedAt,
    sourceOfTruth: {
      app: "apps/api/src/app.ts#createApp",
      routes: ["apps/api/src/app.ts", "apps/api/src/routes/**"],
    },
    summary: {
      routeCount: routes.length,
      uniqueMethods: [...new Set(routes.map((route) => route.method))],
      governedSurfaces: Object.fromEntries(
        [...new Set(routes.map((route) => route.surface))]
          .sort((left, right) => left.localeCompare(right))
          .map((surface) => [
            surface,
            routes.filter((route) => route.surface === surface).length,
          ])
      ),
    },
    routes,
  }
}

export async function writeApiRouteSurfaceArtifacts(
  report: ApiRouteSurfaceReport
): Promise<void> {
  await writeJsonFile(jsonReportPath, report)
  await fs.mkdir(path.dirname(markdownReportPath), { recursive: true })
  await fs.writeFile(
    markdownReportPath,
    renderApiRouteSurfaceMarkdown(report),
    "utf8"
  )
}

export async function generateApiRouteSurfaceArtifacts(
  generatedAt = new Date().toISOString()
): Promise<ApiRouteSurfaceReport> {
  const report = buildApiRouteSurfaceReport(generatedAt)
  await writeApiRouteSurfaceArtifacts(report)
  return report
}

async function main() {
  await generateApiRouteSurfaceArtifacts()

  console.log(
    `API route surface written to ${path.relative(workspaceRoot, jsonReportPath)} and ${path.relative(workspaceRoot, markdownReportPath)}`
  )
}

const entryScriptPath = process.argv[1]
  ? path.resolve(process.argv[1])
  : undefined

if (
  entryScriptPath !== undefined &&
  fileURLToPath(import.meta.url) === entryScriptPath
) {
  await main()
}
