import { db, type DatabaseClient } from "@afenda/database"
import { sql } from "drizzle-orm"

import type {
  DependencyHealth,
  DependencyProbe,
  ModuleHealth,
  ModuleProbe,
  SystemHealth,
  UsageMetrics,
} from "./contracts"

type SystemMonitorOptions = {
  readonly database?: DatabaseClient
  readonly moduleProbes?: readonly ModuleProbe[]
  readonly natsProbe?: DependencyProbe
  readonly redisProbe?: DependencyProbe
  readonly now?: () => Date
  readonly usageProvider?: (
    tenantId: string,
    period: string
  ) => Promise<Partial<UsageMetrics>>
}

function parsePeriodBounds(period: string): { start: Date; end: Date } {
  const match = /^(?<year>\d{4})-(?<month>\d{2})$/.exec(period)
  if (!match?.groups) {
    throw new Error(`getUsageMetrics: invalid period "${period}"`)
  }

  const year = Number(match.groups.year)
  const monthIndex = Number(match.groups.month) - 1
  const start = new Date(Date.UTC(year, monthIndex, 1))
  const end = new Date(Date.UTC(year, monthIndex + 1, 1))

  return { start, end }
}

async function runDependencyProbe(
  probe?: DependencyProbe
): Promise<DependencyHealth> {
  if (!probe) {
    return {
      connected: false,
      latency: -1,
      detail: "no probe configured",
    }
  }

  try {
    return await probe()
  } catch (error) {
    return {
      connected: false,
      latency: -1,
      detail:
        error instanceof Error ? error.message : "unknown dependency failure",
    }
  }
}

export class SystemMonitor {
  private readonly database: DatabaseClient
  private readonly moduleProbes: readonly ModuleProbe[]
  private readonly natsProbe?: DependencyProbe
  private readonly redisProbe?: DependencyProbe
  private readonly now: () => Date
  private readonly usageProvider?: (
    tenantId: string,
    period: string
  ) => Promise<Partial<UsageMetrics>>
  private readonly startedAtMs: number

  constructor(options: SystemMonitorOptions = {}) {
    this.database = options.database ?? db
    this.moduleProbes = options.moduleProbes ?? []
    this.natsProbe = options.natsProbe
    this.redisProbe = options.redisProbe
    this.now = options.now ?? (() => new Date())
    this.usageProvider = options.usageProvider
    this.startedAtMs = this.now().getTime()
  }

  async getHealth(): Promise<SystemHealth> {
    const [databaseHealth, modules, nats, redis] = await Promise.all([
      this.checkDatabase(),
      this.checkModules(),
      runDependencyProbe(this.natsProbe),
      runDependencyProbe(this.redisProbe),
    ])

    const hasModuleFailure = modules.some((moduleHealth) => {
      return moduleHealth.status === "down"
    })

    const allCoreDependenciesHealthy =
      databaseHealth.connected && nats.connected && redis.connected

    return {
      status:
        allCoreDependenciesHealthy && !hasModuleFailure
          ? "healthy"
          : databaseHealth.connected
            ? "degraded"
            : "down",
      uptime: Math.floor((this.now().getTime() - this.startedAtMs) / 1000),
      modules,
      database: databaseHealth,
      nats,
      redis,
    }
  }

  async getUsageMetrics(
    tenantId: string,
    period: string
  ): Promise<UsageMetrics> {
    const baseline = {
      tenantId,
      period,
      apiCalls: 0,
      activeUsers: 0,
      storageUsedMB: 0,
      eventsPublished: 0,
      journalEntries: 0,
      invoicesCreated: 0,
    }

    if (!this.usageProvider) {
      return baseline
    }

    return {
      ...baseline,
      ...(await this.usageProvider(tenantId, period)),
    }
  }

  private async checkDatabase(): Promise<DependencyHealth> {
    const startedAt = this.now().getTime()

    try {
      await this.database.execute(sql`select 1`)
      return {
        connected: true,
        latency: this.now().getTime() - startedAt,
      }
    } catch (error) {
      return {
        connected: false,
        latency: -1,
        detail:
          error instanceof Error ? error.message : "database probe failed",
      }
    }
  }

  private async checkModules(): Promise<readonly ModuleHealth[]> {
    const checks = this.moduleProbes.map(async (probe) => {
      try {
        const result = await probe.run()
        return {
          name: probe.name,
          status: result.status,
          responseTime: result.responseTime,
          lastCheck: this.now(),
          detail: result.detail,
        } satisfies ModuleHealth
      } catch (error) {
        return {
          name: probe.name,
          status: "down",
          responseTime: -1,
          lastCheck: this.now(),
          detail:
            error instanceof Error ? error.message : "module probe failed",
        } satisfies ModuleHealth
      }
    })

    return Promise.all(checks)
  }
}

export function createUsageProvider(database: DatabaseClient = db) {
  return async (
    tenantId: string,
    period: string
  ): Promise<Partial<UsageMetrics>> => {
    const { start, end } = parsePeriodBounds(period)

    const [activeUsersResult, eventCountResult] = await Promise.all([
      database.execute(sql`
        select count(*)::int as active_users
        from iam.tenant_memberships
        where tenant_id = ${tenantId}
          and membership_status = 'active'
          and is_deleted = false
      `),
      database.execute(sql`
        select count(*)::int as event_count
        from governance.audit_logs
        where tenant_id = ${tenantId}
          and occurred_at >= ${start}
          and occurred_at < ${end}
      `),
    ])

    const activeUsers =
      Number(
        activeUsersResult.rows[0] && "active_users" in activeUsersResult.rows[0]
          ? activeUsersResult.rows[0].active_users
          : 0
      ) || 0

    const eventCount =
      Number(
        eventCountResult.rows[0] && "event_count" in eventCountResult.rows[0]
          ? eventCountResult.rows[0].event_count
          : 0
      ) || 0

    return {
      activeUsers,
      eventsPublished: eventCount,
      apiCalls: eventCount,
    }
  }
}
