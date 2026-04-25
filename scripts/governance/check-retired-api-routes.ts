import path from "node:path"
import { fileURLToPath } from "node:url"

import {
  buildApiRouteSurfaceReport,
  type ApiRouteSurfaceReport,
} from "./generate-api-route-surface.js"

export const RETIRED_API_ROUTES = [
  "/api/v1/ops/workspace",
  "/api/v1/ops/events/:eventId/claim",
  "/api/v1/ops/events/:eventId/advance",
] as const

export function findRetiredApiRoutes(report: ApiRouteSurfaceReport): string[] {
  const liveRoutes = new Set(report.routes.map((route) => route.path))

  return RETIRED_API_ROUTES.filter((routePath) => liveRoutes.has(routePath))
}

async function main() {
  const report = buildApiRouteSurfaceReport()
  const retiredRoutes = findRetiredApiRoutes(report)

  if (retiredRoutes.length === 0) {
    console.log("Retired API route denylist check passed.")
    process.exit(0)
  }

  console.error("Retired API route denylist check found forbidden route(s):")
  for (const routePath of retiredRoutes) {
    console.error(`- ${routePath}`)
  }

  process.exit(1)
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
