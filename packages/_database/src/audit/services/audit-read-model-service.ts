import type { DatabaseClient } from "../../client"
import type { AuditAdminView } from "../contracts/audit-admin-view-contract"
import { toAuditAdminView } from "../read-model/audit-read-model"
import { queryAuditLogs } from "./audit-query-service"

export async function queryAuditAdminViews(
  database: DatabaseClient,
  input: Parameters<typeof queryAuditLogs>[1]
): Promise<AuditAdminView[]> {
  const rows = await queryAuditLogs(database, input)
  return rows.map(toAuditAdminView)
}
