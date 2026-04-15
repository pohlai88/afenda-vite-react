-- One-time bridge: copy Better Auth user id from JSON metadata into governed auth_user_id
-- for auth security rows emitted before emitAfendaAuthSecurityAudit set auth_user_id at write time.
-- Safe to re-run: only updates rows where auth_user_id IS NULL.
--> statement-breakpoint
UPDATE audit_logs
SET auth_user_id = metadata->>'betterAuthUserId'
WHERE auth_user_id IS NULL
  AND metadata ? 'betterAuthUserId'
  AND action IN (
    'auth.session.created',
    'auth.session.revoked',
    'auth.account.linked',
    'auth.user.updated'
  );
