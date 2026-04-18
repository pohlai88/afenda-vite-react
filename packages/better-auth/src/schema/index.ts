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
 * Runtime today uses `database: pool` (Kysely) in `createAfendaAuth`; this folder is the
 * **contract** for `drizzleAdapter(db, { provider: "pg", schema: { ... } })` and matches
 * `pnpm run auth:migrate` DDL. See `README.md` for IAM bridge (`iam.identity_links`).
 */
export * from "./auth-schema.generated"
