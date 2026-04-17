import { sql } from "drizzle-orm"

import type { DatabaseClient } from "../client"
import { STUDIO_PG_ENUM_ALLOWLIST } from "./pg-enum-allowlist"

export type PgEnumRow = {
  readonly schema_name: string
  readonly enum_name: string
  readonly value: string
  readonly sort_order: number
}

/**
 * Read-only: enum labels for allowlisted typnames in `public` (Afenda app enums).
 */
export async function queryAllowlistedPgEnums(
  db: DatabaseClient
): Promise<readonly PgEnumRow[]> {
  const list = STUDIO_PG_ENUM_ALLOWLIST
  if (list.length === 0) {
    return []
  }

  const fragments = list.map((name) => sql`${name}`)
  const result = await db.execute(sql`
    SELECT
      n.nspname::text AS schema_name,
      t.typname::text AS enum_name,
      e.enumlabel::text AS value,
      e.enumsortorder::int AS sort_order
    FROM pg_catalog.pg_type t
    INNER JOIN pg_catalog.pg_enum e ON t.oid = e.enumtypid
    INNER JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
      AND t.typname IN (${sql.join(fragments, sql`, `)})
    ORDER BY t.typname ASC, e.enumsortorder ASC
  `)

  const rawRows =
    result &&
    typeof result === "object" &&
    "rows" in result &&
    Array.isArray((result as { rows: unknown }).rows)
      ? (result as { rows: Record<string, unknown>[] }).rows
      : []
  const rows = rawRows
  return rows.map((row) => ({
    schema_name: String(row.schema_name ?? ""),
    enum_name: String(row.enum_name ?? ""),
    value: String(row.value ?? ""),
    sort_order: Number(row.sort_order ?? 0),
  }))
}
