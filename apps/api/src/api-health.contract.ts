/**
 * Typed health contracts for the API-wide operational probe surface.
 * Owns health payload shapes only; route handlers and checks consume this module.
 *
 * @module api-health.contract
 * @package @afenda/api
 */
export type ApiHealthStatus = "healthy" | "degraded" | "unhealthy"

export type ApiHealthProbeStatus = "ok" | "error"

export interface ApiDependencyHealth {
  readonly name: string
  readonly status: ApiHealthStatus
  readonly responseTimeMs: number
  readonly critical: boolean
  readonly message?: string
  readonly details?: Record<string, unknown>
}

export interface ApiHealthReport {
  readonly status: ApiHealthStatus
  readonly service: string
  readonly version: string
  readonly uptimeSeconds: number
  readonly timestamp: string
  readonly dependencies: readonly ApiDependencyHealth[]
  readonly system: {
    readonly nodeVersion: string
    readonly memoryUsageMb: {
      readonly heapUsed: number
      readonly heapTotal: number
      readonly rss: number
      readonly external: number
    }
    readonly cpuUsageMicros: {
      readonly user: number
      readonly system: number
    }
  }
}

export interface ApiHealthProbeResult {
  readonly status: ApiHealthProbeStatus
  readonly message?: string
  readonly checks?: readonly ApiDependencyHealth[]
}

export interface ApiHealthVersionReport {
  readonly service: string
  readonly version: string
  readonly nodeVersion: string
  readonly environment: string
}

export interface ApiHealthCheckResult {
  readonly healthy: boolean
  readonly message?: string
  readonly details?: Record<string, unknown>
}

export interface ApiHealthCheck {
  readonly name: string
  readonly critical?: boolean
  readonly timeoutMs?: number
  readonly check: () => Promise<ApiHealthCheckResult>
}

export interface ApiHealthManagerConfig {
  readonly service: string
  readonly version: string
  readonly checks: readonly ApiHealthCheck[]
  readonly startedAt?: Date
}
