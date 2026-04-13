CREATE TYPE "public"."audit_risk_level" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'deployment_environment' AND e.enumlabel = 'production'
  ) THEN
    ALTER TYPE "public"."deployment_environment" ADD VALUE 'production';
  END IF;
END $$;--> statement-breakpoint
UPDATE "audit_logs" SET "risk_level" = 'low' WHERE "risk_level" IS NULL;--> statement-breakpoint
UPDATE "audit_logs" SET "environment" = 'production' WHERE "environment" IS NULL;--> statement-breakpoint
ALTER TABLE "audit_logs" ALTER COLUMN "risk_level" SET DEFAULT 'low'::"public"."audit_risk_level";--> statement-breakpoint
ALTER TABLE "audit_logs" ALTER COLUMN "risk_level" SET DATA TYPE "public"."audit_risk_level" USING COALESCE("risk_level", 'low')::"public"."audit_risk_level";--> statement-breakpoint
ALTER TABLE "audit_logs" ALTER COLUMN "risk_level" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "audit_logs" ALTER COLUMN "environment" SET DEFAULT 'production';--> statement-breakpoint
ALTER TABLE "audit_logs" ALTER COLUMN "environment" SET NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_logs_risk_recorded_idx" ON "audit_logs" USING btree ("risk_level","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_logs_outcome_recorded_idx" ON "audit_logs" USING btree ("outcome","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_logs_causation_idx" ON "audit_logs" USING btree ("causation_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_logs_command_idx" ON "audit_logs" USING btree ("command_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_logs_batch_idx" ON "audit_logs" USING btree ("batch_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_logs_job_idx" ON "audit_logs" USING btree ("job_id");
