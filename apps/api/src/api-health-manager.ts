/**
 * API health manager: owns probe orchestration and typed health reports.
 * Routes consume the singleton manager; future DB/cache/broker checks plug in here.
 *
 * @module api-health-manager
 * @package @afenda/api
 */
import apiPackage from "../package.json" with { type: "json" }

import type {
  ApiDependencyHealth,
  ApiHealthCheck,
  ApiHealthManagerConfig,
  ApiHealthProbeResult,
  ApiHealthReport,
  ApiHealthStatus,
  ApiHealthVersionReport,
} from "./api-health.contract.js"
import { createApiMemoryHealthCheck } from "./api-memory-health.check.js"

function buildSystemSnapshot() {
  const memoryUsage = process.memoryUsage()
  const cpuUsage = process.cpuUsage()

  return {
    nodeVersion: process.version,
    memoryUsageMb: {
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      rss: Math.round(memoryUsage.rss / 1024 / 1024),
      external: Math.round(memoryUsage.external / 1024 / 1024),
    },
    cpuUsageMicros: {
      user: cpuUsage.user,
      system: cpuUsage.system,
    },
  }
}

export class ApiHealthManager {
  readonly #config: ApiHealthManagerConfig
  readonly #startedAt: Date
  #ready = false

  constructor(config: ApiHealthManagerConfig) {
    this.#config = config
    this.#startedAt = config.startedAt ?? new Date()
  }

  setReady(): void {
    this.#ready = true
  }

  resetForTests(): void {
    this.#ready = false
  }

  async getHealth(): Promise<ApiHealthReport> {
    const dependencies = await this.#runChecks(this.#config.checks)
    const status = this.#resolveOverallStatus(dependencies)

    return {
      status,
      service: this.#config.service,
      version: this.#config.version,
      uptimeSeconds: Math.round(
        (Date.now() - this.#startedAt.getTime()) / 1000
      ),
      timestamp: new Date().toISOString(),
      dependencies,
      system: buildSystemSnapshot(),
    }
  }

  async getLiveness(): Promise<ApiHealthProbeResult> {
    try {
      const buffer = Buffer.alloc(256)
      buffer.fill(0)
      return { status: "ok" }
    } catch {
      return {
        status: "error",
        message: "Process unresponsive",
      }
    }
  }

  async getReadiness(): Promise<ApiHealthProbeResult> {
    if (!this.#ready) {
      return {
        status: "error",
        message: "Service not yet initialized",
        checks: [],
      }
    }

    const criticalChecks = this.#config.checks.filter(
      (check) => check.critical !== false
    )
    const results = await this.#runChecks(criticalChecks)
    const allHealthy = results.every((result) => result.status === "healthy")

    return {
      status: allHealthy ? "ok" : "error",
      message: allHealthy
        ? undefined
        : "One or more critical dependencies are unhealthy",
      checks: results,
    }
  }

  async getStartup(): Promise<ApiHealthProbeResult> {
    return {
      status: this.#ready ? "ok" : "error",
      message: this.#ready ? undefined : "Service not yet initialized",
    }
  }

  async getVersion(): Promise<ApiHealthVersionReport> {
    return {
      service: this.#config.service,
      version: this.#config.version,
      nodeVersion: process.version,
      environment: process.env.NODE_ENV ?? "development",
    }
  }

  #resolveOverallStatus(
    dependencies: readonly ApiDependencyHealth[]
  ): ApiHealthStatus {
    const hasCriticalFailure = dependencies.some(
      (dependency) => dependency.critical && dependency.status === "unhealthy"
    )

    if (hasCriticalFailure) {
      return "unhealthy"
    }

    const hasNonHealthyDependency = dependencies.some(
      (dependency) => dependency.status !== "healthy"
    )

    return hasNonHealthyDependency ? "degraded" : "healthy"
  }

  async #runChecks(
    checks: readonly ApiHealthCheck[]
  ): Promise<readonly ApiDependencyHealth[]> {
    const results = await Promise.all(
      checks.map(async (check) => {
        const timeoutMs = check.timeoutMs ?? 5_000
        const startedAt = Date.now()

        try {
          const result = await Promise.race([
            check.check(),
            new Promise<never>((_, reject) => {
              setTimeout(() => {
                reject(
                  new Error(
                    `Health check "${check.name}" timed out after ${timeoutMs}ms`
                  )
                )
              }, timeoutMs)
            }),
          ])

          return {
            name: check.name,
            critical: check.critical !== false,
            status: result.healthy ? "healthy" : "unhealthy",
            responseTimeMs: Date.now() - startedAt,
            message: result.message,
            details: result.details,
          } satisfies ApiDependencyHealth
        } catch (error) {
          return {
            name: check.name,
            critical: check.critical !== false,
            status: "unhealthy",
            responseTimeMs: Date.now() - startedAt,
            message:
              error instanceof Error ? error.message : "Unknown health error",
          } satisfies ApiDependencyHealth
        }
      })
    )

    return results
  }
}

export const apiHealthManager = new ApiHealthManager({
  service: "@afenda/api",
  version: apiPackage.version,
  checks: [createApiMemoryHealthCheck()],
})

export function markApiHealthReady(): void {
  apiHealthManager.setReady()
}

export function resetApiHealthManagerForTests(): void {
  apiHealthManager.resetForTests()
}
