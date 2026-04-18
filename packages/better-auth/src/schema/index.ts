/**
 * Better Auth **Drizzle** table definitions for PostgreSQL (`public` schema by default).
 *
 * The canonical generated artifact is `auth-schema.generated.ts` (do not hand-edit).
 * Regenerate when `createAfendaAuth` plugins or session fields change:
 *
 * ```
 * pnpm --filter @afenda/better-auth run auth:generate
 * ```
 *
 * Runtime uses `database: pool` (Kysely) in `createAfendaAuth`, not `drizzleAdapter`. This folder
 * is the CLI-generated Drizzle mirror (see `auth:generate --adapter drizzle`) and matches
 * `auth:migrate` DDL. See `README.md` (Drizzle vs PostgreSQL adapter) and IAM (`iam.identity_links`).
 */
export * from "./auth-schema.generated"
