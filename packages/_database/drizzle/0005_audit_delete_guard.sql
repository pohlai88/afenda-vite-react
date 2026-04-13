--> Optional DB-level protection: block DELETE on append-only audit evidence.
--> PostgreSQL 14+: EXECUTE FUNCTION; on PG 13 use EXECUTE PROCEDURE with the same function name.
CREATE OR REPLACE FUNCTION prevent_audit_log_delete()
RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'audit_logs is append-only; DELETE is prohibited';
END;
$$ LANGUAGE plpgsql;--> statement-breakpoint
DROP TRIGGER IF EXISTS audit_logs_no_delete_trigger ON audit_logs;--> statement-breakpoint
CREATE TRIGGER audit_logs_no_delete_trigger
BEFORE DELETE ON audit_logs
FOR EACH ROW
EXECUTE FUNCTION prevent_audit_log_delete();
