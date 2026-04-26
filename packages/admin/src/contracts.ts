import type { AuditActionKey } from "@afenda/database"

export type AdminTier = "basic" | "pro" | "enterprise"

export type TenantInfo = {
  readonly id: string
  readonly name: string
  readonly slug: string
  readonly tier: AdminTier
  readonly isActive: boolean
  readonly userCount: number
  readonly storageUsedMB: number
  readonly modules: readonly string[]
  readonly createdAt: Date
  readonly lastActivityAt: Date | null
}

export type CreateTenantInput = {
  readonly tenantCode: string
  readonly tenantName: string
  readonly tenantType:
    | "enterprise"
    | "group"
    | "franchise"
    | "nonprofit"
    | "holding"
  readonly baseCurrencyCode: string
  readonly defaultLocaleCode: string
  readonly defaultTimezoneName: string
  readonly countryCode: string
  readonly governanceLevel: "centralized" | "federated" | "decentralized"
  readonly activationDate?: string | null
  readonly aliases?: readonly string[]
  readonly requestedTier?: AdminTier
  readonly metadata?: Record<string, unknown>
  readonly adminUserAccountId?: string
  readonly adminDisplayName?: string
  readonly adminEmail?: string | null
  readonly adminMembershipType?:
    | "employee"
    | "partner"
    | "auditor"
    | "consultant"
    | "system"
  readonly createdBy?: string | null
}

export type ModuleHealth = {
  readonly name: string
  readonly status: "up" | "down" | "slow"
  readonly responseTime: number
  readonly lastCheck: Date
  readonly detail?: string
}

export type DependencyHealth = {
  readonly connected: boolean
  readonly latency: number
  readonly detail?: string
}

export type SystemHealth = {
  readonly status: "healthy" | "degraded" | "down"
  readonly uptime: number
  readonly modules: readonly ModuleHealth[]
  readonly database: DependencyHealth
  readonly nats: DependencyHealth
  readonly redis: DependencyHealth
}

export type UsageMetrics = {
  readonly tenantId: string
  readonly period: string
  readonly apiCalls: number
  readonly activeUsers: number
  readonly storageUsedMB: number
  readonly eventsPublished: number
  readonly journalEntries: number
  readonly invoicesCreated: number
}

export type AuditChanges = Record<
  string,
  {
    readonly old: unknown
    readonly new: unknown
  }
>

export type AuditEntry = {
  readonly id: string
  readonly action: string
  readonly entity: string
  readonly entityId: string
  readonly userId: string
  readonly userName: string
  readonly tenantId: string
  readonly changes: AuditChanges
  readonly ipAddress?: string
  readonly userAgent?: string
  readonly createdAt: Date
}

export type AuditWriteEntry = {
  readonly action: AuditActionKey
  readonly entity: string
  readonly entityId: string
  readonly userId: string
  readonly tenantId: string
  readonly changes?: AuditChanges
  readonly ipAddress?: string
  readonly userAgent?: string
  readonly requestId?: string
  readonly traceId?: string
  readonly correlationId?: string
}

export type AuditQueryParams = {
  readonly tenantId: string
  readonly entity?: string
  readonly entityId?: string
  readonly userId?: string
  readonly action?: string
  readonly from?: Date
  readonly to?: Date
  readonly page?: number
  readonly pageSize?: number
}

export type ModuleProbe = {
  readonly name: string
  readonly run: () => Promise<Omit<ModuleHealth, "name" | "lastCheck">>
}

export type DependencyProbe = () => Promise<DependencyHealth>
