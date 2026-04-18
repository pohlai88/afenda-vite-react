/**
 * Validates generated Drizzle SQL + migration metadata (`db:validate-sql`).
 * Legacy script name kept for `db:check-migrations` / `db:ci`.
 */
import { runValidateDrizzleSql } from "./validate-drizzle-sql.js"

runValidateDrizzleSql()
