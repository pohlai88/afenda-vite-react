import { pgSchema } from "drizzle-orm/pg-core"

/** Reserved for fiscal/COA tables (guideline 002/004). No tables in grounding milestone. */
export const finance = pgSchema("finance")
