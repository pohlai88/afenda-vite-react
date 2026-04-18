/**
 * CI guard: composite `foreignKey` targets `(tenant_id, id)` require Drizzle `unique()`, not `uniqueIndex()`.
 *
 * @see ../src/schema/pkg-governance/composite-fk-unique-guard.ts
 */
import path from "node:path"
import { fileURLToPath } from "node:url"

import { runCompositeFkUniqueGuard } from "../src/schema/pkg-governance/composite-fk-unique-guard.js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const databaseRoot = path.join(__dirname, "..")

runCompositeFkUniqueGuard(databaseRoot)
