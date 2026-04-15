-- Recreate `auth_challenges` with Postgres enums + indexes (replaces legacy text columns from 0012).
-- Safe for dev DBs; production: run during a maintenance window if 0012 already shipped.

--> statement-breakpoint
DROP TABLE IF EXISTS "auth_challenges" CASCADE;

--> statement-breakpoint
DO $$ BEGIN
  CREATE TYPE auth_challenge_method AS ENUM ('passkey', 'totp', 'email_otp');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

--> statement-breakpoint
DO $$ BEGIN
  CREATE TYPE auth_challenge_status AS ENUM ('issued', 'verified', 'consumed', 'expired', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

--> statement-breakpoint
CREATE TABLE IF NOT EXISTS auth_challenges (
  id text PRIMARY KEY,
  challenge_id text NOT NULL,
  subject_user_id text NULL,
  subject_email text NOT NULL,

  method auth_challenge_method NOT NULL,
  status auth_challenge_status NOT NULL,

  expires_at timestamptz NOT NULL,
  attempts_remaining integer NOT NULL,

  risk_snapshot jsonb NOT NULL,
  device_context_hash text NULL,

  issued_at timestamptz NOT NULL,
  verified_at timestamptz NULL,
  consumed_at timestamptz NULL,
  expired_at timestamptz NULL,
  cancelled_at timestamptz NULL,

  CONSTRAINT auth_challenges_attempts_remaining_nonnegative
    CHECK (attempts_remaining >= 0)
);

--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS auth_challenges_challenge_id_uidx
  ON auth_challenges (challenge_id);

--> statement-breakpoint
CREATE INDEX IF NOT EXISTS auth_challenges_subject_user_id_idx
  ON auth_challenges (subject_user_id);

--> statement-breakpoint
CREATE INDEX IF NOT EXISTS auth_challenges_subject_email_idx
  ON auth_challenges (subject_email);

--> statement-breakpoint
CREATE INDEX IF NOT EXISTS auth_challenges_status_expires_idx
  ON auth_challenges (status, expires_at);
