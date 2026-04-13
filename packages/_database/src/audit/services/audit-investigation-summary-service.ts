import type { DatabaseClient } from "../../client"
import type { AuditInvestigationSummary } from "../read-model/audit-investigation-summary"
import { summarizeAuditViews } from "../read-model/audit-investigation-summary"
import { queryAuditAdminViews } from "./audit-read-model-service"

export async function getAuditInvestigationSummary(
  database: DatabaseClient,
  input: Parameters<typeof queryAuditAdminViews>[1]
): Promise<AuditInvestigationSummary> {
  const rows = await queryAuditAdminViews(database, input)
  return summarizeAuditViews(rows)
}
