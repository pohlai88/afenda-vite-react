import { vi } from "vitest"

import type { DatabaseClient } from "../../../client"

/** Drizzle-style chain ending in `limit().then()` for `queryAuditLogs` / investigation services. */
export function createSelectLimitMock<T>(rows: T[]): DatabaseClient {
  const limit = vi.fn().mockResolvedValue(rows)
  const orderBy = vi.fn().mockReturnValue({ limit })
  const where = vi.fn().mockReturnValue({ orderBy })
  const from = vi.fn().mockReturnValue({ where })
  const select = vi.fn().mockReturnValue({ from })
  return { select } as unknown as DatabaseClient
}

/** Drizzle-style chain for `queryAuditRowsForRetentionReview` (select → from → where → limit). */
export function createSelectLimitMockNoOrderBy<T>(rows: T[]): DatabaseClient {
  const limit = vi.fn().mockResolvedValue(rows)
  const where = vi.fn().mockReturnValue({ limit })
  const from = vi.fn().mockReturnValue({ where })
  const select = vi.fn().mockReturnValue({ from })
  return { select } as unknown as DatabaseClient
}

export function createInsertReturningMock<T>(rows: T[]): DatabaseClient {
  const returning = vi.fn().mockResolvedValue(rows)
  const values = vi.fn().mockReturnValue({ returning })
  const insert = vi.fn().mockReturnValue({ values })
  return { insert } as unknown as DatabaseClient
}
