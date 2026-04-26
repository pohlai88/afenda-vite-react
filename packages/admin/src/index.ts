import { db } from "@afenda/database"

import { AuditService } from "./audit-admin-service"
import { createUsageProvider, SystemMonitor } from "./system-health-service"
import { TenantManager } from "./tenant-admin-service"

export * from "./contracts"
export * from "./module-catalog"
export * from "./tenant-admin-service"
export * from "./system-health-service"
export * from "./audit-admin-service"

export { TenantManager, SystemMonitor, AuditService }

export const tenantManager = new TenantManager(db)
export const systemMonitor = new SystemMonitor({
  database: db,
  usageProvider: createUsageProvider(db),
})
export const auditService = new AuditService(db)
