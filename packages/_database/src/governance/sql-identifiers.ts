import { PG_IDENTIFIER_MAX_LENGTH } from "./constants.js"

const SEG = /[^a-z0-9_]+/gu

function segment(raw: string): string {
  return raw.trim().toLowerCase().replace(SEG, "_").replace(/^_+|_+$/gu, "")
}

function join(parts: string[]): string {
  return parts.map(segment).filter(Boolean).join("_")
}

/**
 * Asserts length for Postgres identifiers; throws in development if exceeded.
 * Production code should still prefer shorter, stable names.
 */
export function assertPgIdentifierLength(name: string, label = "identifier"): void {
  if (name.length > PG_IDENTIFIER_MAX_LENGTH) {
    throw new Error(
      `${label} exceeds ${PG_IDENTIFIER_MAX_LENGTH} chars (${name.length}): ${name.slice(0, 80)}…`
    )
  }
}

/** Primary key constraint: `{table}_pk` */
export function pkName(table: string): string {
  const n = join([table, "pk"])
  assertPgIdentifierLength(n, "pkName")
  return n
}

/** Composite primary key: `{table}_pk` (same pattern; composite is defined on columns in Drizzle). */
export function compositePkName(table: string): string {
  return pkName(table)
}

/**
 * Foreign key: `{child_table}_{column}_fk` (single column).
 * For multi-column FKs, pass a stable descriptor, e.g. `fkName("orders", "tenant_ref", "composite")`.
 */
export function fkName(childTable: string, columnOrDescriptor: string, suffix = "fk"): string {
  const n = join([childTable, columnOrDescriptor, suffix])
  assertPgIdentifierLength(n, "fkName")
  return n
}

/** Unique constraint: `{table}_{purpose}_uq` */
export function uniqueName(table: string, purpose: string): string {
  const n = join([table, purpose, "uq"])
  assertPgIdentifierLength(n, "uniqueName")
  return n
}

/** B-tree / general index: `{table}_{columnOrPurpose}_idx` */
export function indexName(table: string, columnOrPurpose: string): string {
  const n = join([table, columnOrPurpose, "idx"])
  assertPgIdentifierLength(n, "indexName")
  return n
}

/** Check constraint: `{table}_{purpose}_chk` */
export function checkName(table: string, purpose: string): string {
  const n = join([table, purpose, "chk"])
  assertPgIdentifierLength(n, "checkName")
  return n
}

/**
 * RLS policy: `{table}_{operation}_{purpose}` — operations often `read` | `write` | `all` | `select` | `insert` | `update` | `delete`.
 */
export function rlsPolicyName(table: string, operation: string, purpose: string): string {
  const n = join([table, operation, purpose])
  assertPgIdentifierLength(n, "rlsPolicyName")
  return n
}

/** Sequence: `{table}_{column}_seq` */
export function sequenceName(table: string, column: string): string {
  const n = join([table, column, "seq"])
  assertPgIdentifierLength(n, "sequenceName")
  return n
}

/** View: `{name}_v` (simple suffix to distinguish from tables) */
export function viewName(name: string): string {
  const n = join([name, "v"])
  assertPgIdentifierLength(n, "viewName")
  return n
}

/** Materialized view: `{name}_mv` */
export function materializedViewName(name: string): string {
  const n = join([name, "mv"])
  assertPgIdentifierLength(n, "materializedViewName")
  return n
}

/** Postgres role names are identifiers; keep lowercase snake_case for consistency. */
export function roleName(application: string, role: string): string {
  const n = join([application, role, "role"])
  assertPgIdentifierLength(n, "roleName")
  return n
}
