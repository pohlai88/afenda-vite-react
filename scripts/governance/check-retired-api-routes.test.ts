import assert from "node:assert/strict"
import test from "node:test"

import {
  findRetiredApiRoutes,
  RETIRED_API_ROUTES,
} from "./check-retired-api-routes.js"
import {
  buildApiRouteSurfaceReport,
  type ApiRouteSurfaceReport,
} from "./generate-api-route-surface.js"

function createFixtureReport(paths: readonly string[]): ApiRouteSurfaceReport {
  return {
    generatedAt: "2026-04-25T00:00:00.000Z",
    sourceOfTruth: {
      app: "fixture",
      routes: ["fixture"],
    },
    summary: {
      routeCount: paths.length,
      uniqueMethods: ["GET"],
      governedSurfaces: {
        other: paths.length,
      },
    },
    routes: paths.map((routePath) => ({
      method: "GET",
      path: routePath,
      basePath: "/",
      surface: "other" as const,
    })),
  }
}

test("retired route checker passes when the route surface is clean", () => {
  const report = createFixtureReport(["/api/v1/me", "/api/v1/ops/events"])

  assert.deepEqual(findRetiredApiRoutes(report), [])
})

test("retired route checker reports a retired route when one reappears", () => {
  const report = createFixtureReport(["/api/v1/me", RETIRED_API_ROUTES[0]])

  assert.deepEqual(findRetiredApiRoutes(report), [RETIRED_API_ROUTES[0]])
})

test("live route surface does not contain retired API routes", () => {
  const report = buildApiRouteSurfaceReport("2026-04-25T00:00:00.000Z")

  assert.deepEqual(findRetiredApiRoutes(report), [])
})
