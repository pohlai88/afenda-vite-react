export interface SourceEvidenceMismatchBinding {
  readonly id: string
  readonly sourcePathPatterns: readonly string[]
  readonly evidencePathPatterns: readonly string[]
  readonly requiredEvidencePaths?: readonly string[]
}

export interface SourceEvidenceMismatchPolicy {
  readonly ignoredStatusPatterns: readonly string[]
  readonly bindings: readonly SourceEvidenceMismatchBinding[]
}

export interface SourceEvidenceMismatchGitEntry {
  readonly path: string
  readonly previousPath?: string
  readonly modifiedTracked: boolean
  readonly untracked: boolean
}
