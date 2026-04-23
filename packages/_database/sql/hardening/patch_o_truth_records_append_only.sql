CREATE OR REPLACE FUNCTION governance.raise_truth_record_immutability_violation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION
    'governance.truth_records is append-only; % is not allowed',
    TG_OP
    USING ERRCODE = 'P0001';
END;
$$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'governance'
      AND c.relname = 'truth_records'
      AND c.relkind = 'r'
  ) THEN
    DROP TRIGGER IF EXISTS trg_truth_records_append_only
      ON governance.truth_records;

    CREATE TRIGGER trg_truth_records_append_only
      BEFORE UPDATE OR DELETE ON governance.truth_records
      FOR EACH ROW
      EXECUTE FUNCTION governance.raise_truth_record_immutability_violation();
  END IF;
END;
$$;
