-- ============================================================
-- Patch G — at most one default document sequence per scope
-- (tenant + legal entity + document type), non-deleted rows only.
-- Requires mdm.document_sequences (landed in a future DDL wave).
-- ============================================================

begin;

do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'mdm'
      and table_name = 'document_sequences'
  ) then
    execute $g$
create unique index if not exists uq_document_sequences_default
  on mdm.document_sequences (tenant_id, legal_entity_id, document_type)
  where is_default = true and is_deleted = false
    $g$;
  end if;
end;
$$;

commit;
