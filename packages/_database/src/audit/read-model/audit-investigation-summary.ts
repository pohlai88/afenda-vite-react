import type { AuditAdminView } from "../contracts/audit-admin-view-contract"

export interface AuditInvestigationSummary {
  total: number
  outcomes: Record<string, number>
  actions: Record<string, number>
  firstRecordedAt: Date | null
  lastRecordedAt: Date | null
}

export function summarizeAuditViews(
  rows: AuditAdminView[]
): AuditInvestigationSummary {
  const outcomes: Record<string, number> = {}
  const actions: Record<string, number> = {}

  let firstRecordedAt: Date | null = null
  let lastRecordedAt: Date | null = null

  for (const row of rows) {
    outcomes[row.outcome] = (outcomes[row.outcome] ?? 0) + 1
    actions[row.action] = (actions[row.action] ?? 0) + 1

    if (!firstRecordedAt || row.recordedAt < firstRecordedAt) {
      firstRecordedAt = row.recordedAt
    }
    if (!lastRecordedAt || row.recordedAt > lastRecordedAt) {
      lastRecordedAt = row.recordedAt
    }
  }

  return {
    total: rows.length,
    outcomes,
    actions,
    firstRecordedAt,
    lastRecordedAt,
  }
}
