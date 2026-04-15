-- `workspace_demo_items` was introduced in 0007 for demos; it is not modeled in Drizzle schema.
-- Run after 0008 so enterprise DDL is applied first.

--> statement-breakpoint
DROP TABLE IF EXISTS "workspace_demo_items" CASCADE;
