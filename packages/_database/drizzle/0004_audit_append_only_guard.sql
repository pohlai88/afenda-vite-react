--> Optional DB-level protection: block in-place UPDATE on append-only audit evidence.
--> PostgreSQL 14+: you may use EXECUTE FUNCTION instead of EXECUTE PROCEDURE (equivalent).
CREATE OR REPLACE FUNCTION prevent_audit_log_update()
RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'audit_logs is append-only; UPDATE is prohibited';
END;
$$ LANGUAGE plpgsql;--> statement-breakpoint
DROP TRIGGER IF EXISTS audit_logs_no_update_trigger ON audit_logs;--> statement-breakpoint
CREATE TRIGGER audit_logs_no_update_trigger
BEFORE UPDATE ON audit_logs
FOR EACH ROW
EXECUTE FUNCTION prevent_audit_log_update();
