-- ============================================================
-- Patch J — canonical document number allocation (SQL-side, row-locked)
-- Call mdm.allocate_document_number(...) instead of app-side increments.
-- Requires mdm.document_sequences and columns: tenant_id, legal_entity_id,
-- document_type, sequence_code, is_default, next_number, prefix_pattern,
-- padding_length, suffix_pattern, status, is_deleted, id.
-- ============================================================

begin;

create or replace function mdm.allocate_document_number(
  p_tenant_id uuid,
  p_legal_entity_id uuid,
  p_document_type varchar,
  p_sequence_code varchar default null
)
returns table (
  sequence_id uuid,
  allocated_number bigint,
  formatted_number text
)
language plpgsql
as $$
declare
  v_seq mdm.document_sequences%rowtype;
  v_allocated bigint;
begin
  select *
  into v_seq
  from mdm.document_sequences
  where tenant_id = p_tenant_id
    and document_type = p_document_type
    and is_deleted = false
    and status = 'active'
    and (
      (p_sequence_code is not null and sequence_code = p_sequence_code)
      or
      (p_sequence_code is null and is_default = true)
    )
    and (
      legal_entity_id = p_legal_entity_id
      or (legal_entity_id is null)
    )
  order by
    case when legal_entity_id = p_legal_entity_id then 0 else 1 end,
    case when p_sequence_code is null and is_default = true then 0 else 1 end,
    id
  limit 1
  for update;

  if not found then
    raise exception 'No active document sequence found for tenant %, legal entity %, document type %, sequence code %',
      p_tenant_id, p_legal_entity_id, p_document_type, p_sequence_code;
  end if;

  update mdm.document_sequences
  set next_number = next_number + 1
  where id = v_seq.id
  returning next_number - 1 into v_allocated;

  sequence_id := v_seq.id;
  allocated_number := v_allocated;
  formatted_number :=
    coalesce(v_seq.prefix_pattern, '')
    || lpad(v_allocated::text, v_seq.padding_length, '0')
    || coalesce(v_seq.suffix_pattern, '');

  return next;
end;
$$;

commit;
