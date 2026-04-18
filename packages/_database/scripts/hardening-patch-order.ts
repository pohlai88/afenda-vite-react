/**
 * Canonical apply order for `sql/hardening/patch_*.sql`.
 * Not strict alphabetical: `patch_c` runs after partial-unique patches `d`–`g` (see README).
 */
export const HARDENING_PATCH_FILENAMES = [
  "patch_a_triggers.sql",
  "patch_b_parties_canonical_name_normalized.sql",
  "patch_d_partial_unique_indexes.sql",
  "patch_e_nullable_scope_uniqueness.sql",
  "patch_f_master_aliases_preferred.sql",
  "patch_g_document_sequences_default.sql",
  "patch_c_gin_trgm_indexes.sql",
  "patch_h_temporal_overlap.sql",
  "patch_i_master_domain_validation.sql",
  "patch_j_allocate_document_number.sql",
  "patch_k_canonical_views.sql",
  "patch_l_row_level_security.sql",
  "patch_m_tenant_role_assignment_scope.sql",
  "patch_n_temporal_overlap_wave.sql",
] as const
