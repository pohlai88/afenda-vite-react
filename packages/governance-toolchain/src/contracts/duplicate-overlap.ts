export interface DuplicateOverlapScope {
  readonly id: string
  readonly title: string
  readonly fileGlobs: readonly string[]
  readonly ignoredBasenames: readonly string[]
}

export interface DuplicateOverlapPolicy {
  readonly ignoredPathPatterns: readonly string[]
  readonly suspiciousVariantPatterns: readonly RegExp[]
  readonly scopes: readonly DuplicateOverlapScope[]
}
