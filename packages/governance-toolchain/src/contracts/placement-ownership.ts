export interface PlacementOwnershipRule {
  readonly owner: string
  readonly root: string
  readonly kind: "runtime-owner" | "shared-root" | "owner-root"
  readonly matchMode: "exact" | "prefix"
}

export interface PlacementOwnershipScope {
  readonly id: string
  readonly scopeRoot: string
  readonly ignorePatterns: readonly string[]
  readonly rules: readonly PlacementOwnershipRule[]
}
