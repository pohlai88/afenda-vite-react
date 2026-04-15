/**
 * Response shape of `GET /v1/me` on `@afenda/api` (BFF: Better Auth + Afenda tenant scope).
 */
export type AfendaMeResponse = {
  readonly betterAuth: {
    readonly user: unknown
    readonly session: unknown
  }
  readonly afenda: {
    readonly afendaUserId: string
    readonly tenantIds: readonly string[]
    readonly defaultTenantId: string | null
  } | null
}
