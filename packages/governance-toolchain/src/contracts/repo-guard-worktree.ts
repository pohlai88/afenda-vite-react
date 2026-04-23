export interface RepoGuardDirtyFilePolicy {
  readonly machineNoiseExcludePatterns: readonly string[]
  readonly protectedGeneratedPaths: readonly string[]
  readonly highConfidenceBackupPatterns: readonly RegExp[]
  readonly warnStemTokens: readonly string[]
}

export interface RepoGuardWorktreeEntry {
  readonly code: string
  readonly path: string
  readonly previousPath?: string
  readonly untracked: boolean
  readonly modifiedTracked: boolean
}

export interface RepoGuardWorkingTreePolicy {
  readonly ignoredWorkingTreePaths: readonly string[]
  readonly protectedGeneratedPaths: readonly string[]
}
