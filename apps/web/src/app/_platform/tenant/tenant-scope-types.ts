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
  readonly actor?: {
    readonly id: string
    readonly roles: readonly string[]
    readonly permissions: readonly string[]
  }
  readonly tenant?: {
    readonly id: string | null
    readonly memberships: ReadonlyArray<{
      readonly tenantId: string
      readonly membershipId: string
      readonly tenantName: string
      readonly tenantCode: string
      readonly isDefault: boolean
    }>
    readonly capabilities: readonly string[]
  }
  readonly truthContext?: {
    readonly enabledModules: readonly string[]
    readonly commandMatrix: ReadonlyArray<{
      readonly type: string
      readonly permission: string
      readonly label: string
    }>
  }
  readonly session?: {
    readonly id: string
    readonly activeTenantId: string | null
    readonly activeMembershipId: string | null
  }
  readonly setup?: {
    readonly state:
      | "auth"
      | "workspace_required"
      | "profile_recommended"
      | "ready"
    readonly hasTenantContext: boolean
    readonly profileRecommended: boolean
  }
}

export type TenantMembershipChoice = NonNullable<
  AfendaMeResponse["tenant"]
>["memberships"][number]
