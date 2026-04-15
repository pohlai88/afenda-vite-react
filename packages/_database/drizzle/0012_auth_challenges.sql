--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "auth_challenges" (
	"id" text PRIMARY KEY NOT NULL,
	"challenge_id" text NOT NULL,
	"subject_user_id" text,
	"subject_email" text NOT NULL,
	"method" text NOT NULL,
	"status" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"attempts_remaining" integer NOT NULL,
	"risk_snapshot" jsonb NOT NULL,
	"device_context_hash" text,
	"issued_at" timestamp with time zone NOT NULL,
	"verified_at" timestamp with time zone,
	"consumed_at" timestamp with time zone,
	"expired_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	"created_by_system" boolean DEFAULT true NOT NULL
);

--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "auth_challenges_challenge_id_uidx" ON "auth_challenges" USING btree ("challenge_id");
