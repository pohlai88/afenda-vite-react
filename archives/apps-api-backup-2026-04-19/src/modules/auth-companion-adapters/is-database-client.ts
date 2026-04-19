import type { DatabaseClient } from "@afenda/database"

/**
 * Tests pass a stub object for `db`; real runtime passes a Drizzle client from
 * {@link createDbClient}.
 */
export function isDatabaseClient(value: unknown): value is DatabaseClient {
  return (
    typeof value === "object" &&
    value !== null &&
    "insert" in value &&
    typeof (value as { insert?: unknown }).insert === "function" &&
    "select" in value &&
    typeof (value as { select?: unknown }).select === "function"
  )
}
