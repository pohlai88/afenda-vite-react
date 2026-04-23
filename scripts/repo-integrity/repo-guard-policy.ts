export interface RepoGuardWaiver {
  readonly ruleId: string
  readonly path: string
  readonly reason: string
  readonly expiresOn: string
}

export interface RepoGuardPolicy {
  readonly machineNoiseExcludePatterns: readonly string[]
  readonly highConfidenceBackupPatterns: readonly RegExp[]
  readonly warnStemTokens: readonly string[]
  readonly protectedGeneratedPaths: readonly string[]
  readonly ignoredWorkingTreePaths: readonly string[]
  readonly reportMarkdownPath: string
  readonly waivers: readonly RepoGuardWaiver[]
}

export const repoGuardPolicy: RepoGuardPolicy = {
  machineNoiseExcludePatterns: [
    ".agents/**",
    ".legacy/**",
    "node_modules/**",
    ".artifacts/**",
    ".turbo/**",
    "coverage/**",
    "**/coverage/**",
    "dist/**",
    "**/dist/**",
    ".cache/**",
    "tmp/**",
    "temp/**",
  ],
  highConfidenceBackupPatterns: [
    /\.(?:bak|old|tmp)$/u,
    /\.(?:copy|orig)\.[^.]+$/u,
    /(?:^|[\\/]).*~$/u,
    /(?:^|[\\/]).*copy\.[^.]+$/u,
  ],
  warnStemTokens: ["final", "temp", "copy", "new"],
  protectedGeneratedPaths: [
    "docs/architecture/governance/generated/governance-register.md",
    "apps/web/scripts/i18n/data/*.json",
    "apps/web/src/app/_platform/i18n/audit/*.json",
    "docs/README.md",
    "scripts/README.md",
  ],
  ignoredWorkingTreePaths: [
    ".artifacts/reports/governance/repo-integrity-guard.report.json",
    ".artifacts/reports/governance/repo-integrity-guard.report.md",
  ],
  reportMarkdownPath:
    ".artifacts/reports/governance/repo-integrity-guard.report.md",
  waivers: [],
} as const
