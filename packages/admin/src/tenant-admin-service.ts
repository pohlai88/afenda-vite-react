import {
  auditLogs,
  db,
  tenantMemberships,
  tenants,
  userAccounts,
  type DatabaseClient,
} from "@afenda/database"
import { and, desc, eq, sql } from "drizzle-orm"

import type { AdminTier, CreateTenantInput, TenantInfo } from "./contracts"
import { getModulesForTier } from "./module-catalog"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function normalizeTier(value: unknown): AdminTier {
  return value === "enterprise" || value === "pro" ? value : "basic"
}

function resolveTierFromMetadata(metadata: Record<string, unknown>): AdminTier {
  if (isRecord(metadata.admin)) {
    return normalizeTier(metadata.admin.tier)
  }
  return normalizeTier(metadata.subscriptionTier)
}

function resolveModulesFromMetadata(
  metadata: Record<string, unknown>,
  fallbackTier: AdminTier
): readonly string[] {
  if (
    isRecord(metadata.admin) &&
    Array.isArray(metadata.admin.enabledModules)
  ) {
    const modules = metadata.admin.enabledModules.filter(
      (value): value is string => typeof value === "string"
    )
    if (modules.length > 0) {
      return modules
    }
  }

  if (Array.isArray(metadata.enabledModules)) {
    const modules = metadata.enabledModules.filter(
      (value): value is string => typeof value === "string"
    )
    if (modules.length > 0) {
      return modules
    }
  }

  return getModulesForTier(fallbackTier)
}

function buildTenantAdminMetadata(
  existing: Record<string, unknown>,
  tier: AdminTier
): Record<string, unknown> {
  const admin = isRecord(existing.admin) ? existing.admin : {}

  return {
    ...existing,
    subscriptionTier: tier,
    enabledModules: [...getModulesForTier(tier)],
    migratedFromLegacyAdmin: true,
    admin: {
      ...admin,
      tier,
      enabledModules: [...getModulesForTier(tier)],
      migratedFromLegacyAdmin: true,
    },
  }
}

function toDateOnlyString(date: Date): string {
  return date.toISOString().slice(0, 10)
}

type TenantListRow = {
  readonly id: string
  readonly tenantCode: string
  readonly tenantName: string
  readonly status: string
  readonly metadata: Record<string, unknown>
  readonly createdAt: Date
  readonly userCount: number
  readonly lastActivityAt: Date | null
}

function mapTenantInfo(row: TenantListRow): TenantInfo {
  const tier = resolveTierFromMetadata(row.metadata)

  return {
    id: row.id,
    name: row.tenantName,
    slug: row.tenantCode,
    tier,
    isActive: row.status === "active",
    userCount: row.userCount,
    storageUsedMB: 0,
    modules: resolveModulesFromMetadata(row.metadata, tier),
    createdAt: row.createdAt,
    lastActivityAt: row.lastActivityAt,
  }
}

export class TenantManager {
  constructor(private readonly database: DatabaseClient = db) {}

  async listTenants(): Promise<TenantInfo[]> {
    const rows = await this.database
      .select({
        id: tenants.id,
        tenantCode: tenants.tenantCode,
        tenantName: tenants.tenantName,
        status: tenants.status,
        metadata: tenants.metadata,
        createdAt: tenants.createdAt,
        userCount: sql<number>`count(distinct ${tenantMemberships.id})`.mapWith(
          Number
        ),
        lastActivityAt: sql<Date | null>`max(${auditLogs.recordedAt})`,
      })
      .from(tenants)
      .leftJoin(
        tenantMemberships,
        and(
          eq(tenantMemberships.tenantId, tenants.id),
          eq(tenantMemberships.membershipStatus, "active"),
          eq(tenantMemberships.isDeleted, false)
        )
      )
      .leftJoin(auditLogs, eq(auditLogs.tenantId, tenants.id))
      .where(eq(tenants.isDeleted, false))
      .groupBy(
        tenants.id,
        tenants.tenantCode,
        tenants.tenantName,
        tenants.status,
        tenants.metadata,
        tenants.createdAt
      )
      .orderBy(desc(tenants.createdAt))

    return rows.map(mapTenantInfo)
  }

  async createTenant(input: CreateTenantInput): Promise<string> {
    const requestedTier = input.requestedTier ?? "basic"
    const metadata = buildTenantAdminMetadata(
      input.metadata ?? {},
      requestedTier
    )

    const [tenant] = await this.database
      .insert(tenants)
      .values({
        tenantCode: input.tenantCode,
        tenantName: input.tenantName,
        tenantType: input.tenantType,
        status: "active",
        baseCurrencyCode: input.baseCurrencyCode,
        defaultLocaleCode: input.defaultLocaleCode,
        defaultTimezoneName: input.defaultTimezoneName,
        countryCode: input.countryCode,
        activationDate: input.activationDate ?? toDateOnlyString(new Date()),
        mdmGovernanceLevel: input.governanceLevel,
        aliases: [...(input.aliases ?? [])],
        metadata,
        createdBy: input.createdBy ?? null,
        updatedBy: input.createdBy ?? null,
      })
      .returning({ id: tenants.id })

    if (!tenant) {
      throw new Error("createTenant: expected one tenant row from returning()")
    }

    const adminUserId =
      input.adminUserAccountId ??
      (await this.createAdminUserAccount({
        adminDisplayName: input.adminDisplayName,
        adminEmail: input.adminEmail,
        createdBy: input.createdBy ?? null,
      }))

    await this.database.insert(tenantMemberships).values({
      tenantId: tenant.id,
      userAccountId: adminUserId,
      membershipStatus: "active",
      membershipType: input.adminMembershipType ?? "employee",
      metadata: {
        bootstrapRole: "admin",
        source: "legacy-admin-adaptation",
      },
    })

    return tenant.id
  }

  async updateTier(tenantId: string, newTier: AdminTier): Promise<void> {
    const [current] = await this.database
      .select({ metadata: tenants.metadata })
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1)

    if (!current) {
      throw new Error(`updateTier: tenant not found for id ${tenantId}`)
    }

    await this.database
      .update(tenants)
      .set({
        metadata: buildTenantAdminMetadata(current.metadata, newTier),
      })
      .where(eq(tenants.id, tenantId))
  }

  async deactivateTenant(tenantId: string): Promise<void> {
    await this.database
      .update(tenants)
      .set({
        status: "inactive",
        deactivationDate: toDateOnlyString(new Date()),
      })
      .where(eq(tenants.id, tenantId))
  }

  private async createAdminUserAccount(input: {
    readonly adminDisplayName?: string
    readonly adminEmail?: string | null
    readonly createdBy: string | null
  }): Promise<string> {
    if (!input.adminDisplayName) {
      throw new Error(
        "createTenant: adminDisplayName is required when adminUserAccountId is not provided"
      )
    }

    const [userAccount] = await this.database
      .insert(userAccounts)
      .values({
        displayName: input.adminDisplayName,
        email: input.adminEmail ?? null,
        accountStatus: "active",
        metadata: {
          source: "legacy-admin-adaptation",
        },
        createdBy: input.createdBy,
        updatedBy: input.createdBy,
      })
      .returning({ id: userAccounts.id })

    if (!userAccount) {
      throw new Error(
        "createTenant: expected one user account row from returning()"
      )
    }

    return userAccount.id
  }
}
