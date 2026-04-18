/**
 * @afenda/database — server-only PostgreSQL + Drizzle persistence boundary for the Afenda monorepo.
 * **Package governance** — deterministic snake_case names for PK/FK/index/RLS/view/sequence identifiers; UTF-8 byte length vs PostgreSQL 63-byte limit. No DDL. Migrations N/A for this file.
 * Import via package exports only (`@afenda/database`, …); do not deep-import `src/` from apps.
 * Not for browser bundles: uses Node pg Pool; `DATABASE_URL` and pool env are server-side secrets, never `VITE_*`.
 * Tenancy, audit append-only semantics, and FK patterns follow `docs/guideline/` (001-postgreSQL-DDL.md, 008-db-tree.md).
 * Schema or relation changes require `db:guard` / `db:ci`; Drizzle Kit output is gitignored until you generate/apply migrations.
 * Studio snapshots & glossary JSON describe intent; runtime truth is PostgreSQL plus migration history.
 * Envelope timestamp: 2026-04-18T12:00:00.000Z
 *
 * This module: `src/schema/pkg-governance/sql-identifiers.ts` — `pkName`, `fkName`, `uniqueName`, `assertPgIdentifierLength`, etc.
 */
import { Buffer } from "node:buffer"

import { PG_IDENTIFIER_MAX_LENGTH } from "./constants.js"

const SEG = /[^a-z0-9_]+/gu

function segment(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(SEG, "_")
    .replace(/^_+|_+$/gu, "")
}

function join(parts: string[]): string {
  return parts.map(segment).filter(Boolean).join("_")
}

/**
 * UTF-8 byte length of `name`, matching PostgreSQL identifier limits (not JS string length).
 * @see https://www.postgresql.org/docs/current/sql-syntax-lexical.html#SQL-SYNTAX-IDENTIFIERS
 */
export function pgIdentifierUtf8ByteLength(name: string): number {
  return Buffer.byteLength(name, "utf8")
}

/**
 * Asserts PostgreSQL identifier byte length; throws if exceeded.
 * Production code should still prefer shorter, stable names.
 */
export function assertPgIdentifierLength(
  name: string,
  label = "identifier"
): void {
  const bytes = pgIdentifierUtf8ByteLength(name)
  if (bytes > PG_IDENTIFIER_MAX_LENGTH) {
    throw new Error(
      `${label} exceeds ${PG_IDENTIFIER_MAX_LENGTH} UTF-8 bytes (${bytes}): ${name.slice(0, 80)}…`
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
export function fkName(
  childTable: string,
  columnOrDescriptor: string,
  suffix = "fk"
): string {
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
export function rlsPolicyName(
  table: string,
  operation: string,
  purpose: string
): string {
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
