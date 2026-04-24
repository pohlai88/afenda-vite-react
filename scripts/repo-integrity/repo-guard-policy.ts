import type {
  DuplicateOverlapPolicy,
  PlacementOwnershipScope,
  SourceEvidenceMismatchPolicy,
} from "@afenda/governance-toolchain"

import type { BoundaryImportPolicy } from "../lib/boundary-import-guard.js"
import type { GeneratedAuthenticityPolicy } from "../lib/generated-artifact-authenticity-guard.js"
import type { DocumentControlPolicy } from "../lib/stronger-document-control-guard.js"

export interface RepoGuardPolicy {
  readonly machineNoiseExcludePatterns: readonly string[]
  readonly placementOwnershipIgnorePatterns: readonly string[]
  readonly placementOwnershipStaticScopes: readonly PlacementOwnershipScope[]
  readonly highConfidenceBackupPatterns: readonly RegExp[]
  readonly warnStemTokens: readonly string[]
  readonly protectedGeneratedPaths: readonly string[]
  readonly ignoredWorkingTreePaths: readonly string[]
  readonly reportMarkdownPath: string
  readonly waiverRegistryPath: string
  readonly waiverSoonToExpireDays: number
  readonly boundaryImport: BoundaryImportPolicy
  readonly duplicateOverlap: DuplicateOverlapPolicy
  readonly strongerDocumentControl: DocumentControlPolicy
  readonly sourceEvidenceMismatch: SourceEvidenceMismatchPolicy
  readonly generatedAuthenticity: GeneratedAuthenticityPolicy
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
  placementOwnershipIgnorePatterns: [
    "**/__tests__/**",
    "**/*.test.ts",
    "**/*.test.tsx",
    "**/*.spec.ts",
    "**/*.spec.tsx",
    "**/*.stories.tsx",
    "**/*.md",
  ],
  placementOwnershipStaticScopes: [
    {
      id: "repo-global-scripts",
      scopeRoot: "scripts",
      ignorePatterns: [],
      rules: [
        {
          owner: "repo-global:scripts",
          root: "scripts",
          kind: "owner-root",
          matchMode: "prefix",
        },
      ],
    },
    {
      id: "web-app-scripts",
      scopeRoot: "apps/web/scripts",
      ignorePatterns: [],
      rules: [
        {
          owner: "apps/web:scripts",
          root: "apps/web/scripts",
          kind: "owner-root",
          matchMode: "prefix",
        },
      ],
    },
    {
      id: "web-client-roots",
      scopeRoot: "apps/web/src",
      ignorePatterns: [],
      rules: [
        {
          owner: "apps/web:app",
          root: "apps/web/src/app",
          kind: "owner-root",
          matchMode: "prefix",
        },
        {
          owner: "apps/web:root-runtime",
          root: "apps/web/src/App.tsx",
          kind: "runtime-owner",
          matchMode: "exact",
        },
        {
          owner: "apps/web:root-runtime",
          root: "apps/web/src/main.tsx",
          kind: "runtime-owner",
          matchMode: "exact",
        },
        {
          owner: "apps/web:root-runtime",
          root: "apps/web/src/router.tsx",
          kind: "runtime-owner",
          matchMode: "exact",
        },
        {
          owner: "apps/web:root-runtime",
          root: "apps/web/src/vite-preload-recovery.ts",
          kind: "runtime-owner",
          matchMode: "exact",
        },
        {
          owner: "apps/web:root-runtime",
          root: "apps/web/src/vite-env.d.ts",
          kind: "runtime-owner",
          matchMode: "exact",
        },
        {
          owner: "apps/web:root-runtime",
          root: "apps/web/src/index.css",
          kind: "runtime-owner",
          matchMode: "exact",
        },
        {
          owner: "apps/web:marketing",
          root: "apps/web/src/marketing",
          kind: "owner-root",
          matchMode: "prefix",
        },
        {
          owner: "apps/web:routes",
          root: "apps/web/src/routes",
          kind: "owner-root",
          matchMode: "prefix",
        },
        {
          owner: "apps/web:rpc",
          root: "apps/web/src/rpc",
          kind: "owner-root",
          matchMode: "prefix",
        },
        {
          owner: "apps/web:share",
          root: "apps/web/src/share",
          kind: "owner-root",
          matchMode: "prefix",
        },
      ],
    },
    {
      id: "api-app-roots",
      scopeRoot: "apps/api/src",
      ignorePatterns: [],
      rules: [
        {
          owner: "apps/api:runtime",
          root: "apps/api/src/app.ts",
          kind: "runtime-owner",
          matchMode: "exact",
        },
        {
          owner: "apps/api:runtime",
          root: "apps/api/src/index.ts",
          kind: "runtime-owner",
          matchMode: "exact",
        },
        {
          owner: "apps/api:command",
          root: "apps/api/src/command",
          kind: "owner-root",
          matchMode: "prefix",
        },
        {
          owner: "apps/api:contract",
          root: "apps/api/src/contract",
          kind: "owner-root",
          matchMode: "prefix",
        },
        {
          owner: "apps/api:lib",
          root: "apps/api/src/lib",
          kind: "owner-root",
          matchMode: "prefix",
        },
        {
          owner: "apps/api:middleware",
          root: "apps/api/src/middleware",
          kind: "owner-root",
          matchMode: "prefix",
        },
        {
          owner: "apps/api:modules",
          root: "apps/api/src/modules",
          kind: "owner-root",
          matchMode: "prefix",
        },
        {
          owner: "apps/api:routes",
          root: "apps/api/src/routes",
          kind: "owner-root",
          matchMode: "prefix",
        },
        {
          owner: "apps/api:truth",
          root: "apps/api/src/truth",
          kind: "owner-root",
          matchMode: "prefix",
        },
      ],
    },
    {
      id: "package-better-auth-src",
      scopeRoot: "packages/better-auth/src",
      ignorePatterns: [],
      rules: [
        {
          owner: "packages/better-auth:src",
          root: "packages/better-auth/src",
          kind: "owner-root",
          matchMode: "prefix",
        },
      ],
    },
    {
      id: "package-better-auth-scripts",
      scopeRoot: "packages/better-auth/scripts",
      ignorePatterns: [],
      rules: [
        {
          owner: "packages/better-auth:scripts",
          root: "packages/better-auth/scripts",
          kind: "owner-root",
          matchMode: "prefix",
        },
      ],
    },
    {
      id: "package-contracts-src",
      scopeRoot: "packages/contracts/src",
      ignorePatterns: [],
      rules: [
        {
          owner: "packages/contracts:src",
          root: "packages/contracts/src",
          kind: "owner-root",
          matchMode: "prefix",
        },
      ],
    },
    {
      id: "package-env-loader-src",
      scopeRoot: "packages/env-loader/src",
      ignorePatterns: [],
      rules: [
        {
          owner: "packages/env-loader:src",
          root: "packages/env-loader/src",
          kind: "owner-root",
          matchMode: "prefix",
        },
      ],
    },
    {
      id: "package-governance-toolchain-src",
      scopeRoot: "packages/governance-toolchain/src",
      ignorePatterns: [],
      rules: [
        {
          owner: "packages/governance-toolchain:src",
          root: "packages/governance-toolchain/src",
          kind: "owner-root",
          matchMode: "prefix",
        },
      ],
    },
    {
      id: "package-pino-logger-src",
      scopeRoot: "packages/pino-logger/src",
      ignorePatterns: [],
      rules: [
        {
          owner: "packages/pino-logger:src",
          root: "packages/pino-logger/src",
          kind: "owner-root",
          matchMode: "prefix",
        },
      ],
    },
    {
      id: "package-vitest-config-src",
      scopeRoot: "packages/vitest-config/src",
      ignorePatterns: [],
      rules: [
        {
          owner: "packages/vitest-config:src",
          root: "packages/vitest-config/src",
          kind: "owner-root",
          matchMode: "prefix",
        },
      ],
    },
    {
      id: "package-eslint-config-src",
      scopeRoot: "packages/eslint-config/src",
      ignorePatterns: [],
      rules: [
        {
          owner: "packages/eslint-config:src",
          root: "packages/eslint-config/src",
          kind: "owner-root",
          matchMode: "prefix",
        },
      ],
    },
    {
      id: "package-design-system-design-architecture",
      scopeRoot: "packages/design-system/design-architecture",
      ignorePatterns: [],
      rules: [
        {
          owner: "packages/design-system:design-architecture",
          root: "packages/design-system/design-architecture",
          kind: "owner-root",
          matchMode: "prefix",
        },
      ],
    },
    {
      id: "package-design-system-generated",
      scopeRoot: "packages/design-system/generated",
      ignorePatterns: [],
      rules: [
        {
          owner: "packages/design-system:generated",
          root: "packages/design-system/generated",
          kind: "owner-root",
          matchMode: "prefix",
        },
      ],
    },
    {
      id: "package-design-system-hooks",
      scopeRoot: "packages/design-system/hooks",
      ignorePatterns: [],
      rules: [
        {
          owner: "packages/design-system:hooks",
          root: "packages/design-system/hooks",
          kind: "owner-root",
          matchMode: "prefix",
        },
      ],
    },
    {
      id: "package-design-system-icons",
      scopeRoot: "packages/design-system/icons",
      ignorePatterns: [],
      rules: [
        {
          owner: "packages/design-system:icons",
          root: "packages/design-system/icons",
          kind: "owner-root",
          matchMode: "prefix",
        },
      ],
    },
    {
      id: "package-design-system-scripts",
      scopeRoot: "packages/design-system/scripts",
      ignorePatterns: [],
      rules: [
        {
          owner: "packages/design-system:scripts",
          root: "packages/design-system/scripts",
          kind: "owner-root",
          matchMode: "prefix",
        },
      ],
    },
    {
      id: "package-design-system-ui-primitives",
      scopeRoot: "packages/design-system/ui-primitives",
      ignorePatterns: [],
      rules: [
        {
          owner: "packages/design-system:ui-primitives",
          root: "packages/design-system/ui-primitives",
          kind: "owner-root",
          matchMode: "prefix",
        },
      ],
    },
    {
      id: "package-design-system-utils",
      scopeRoot: "packages/design-system/utils",
      ignorePatterns: [],
      rules: [
        {
          owner: "packages/design-system:utils",
          root: "packages/design-system/utils",
          kind: "owner-root",
          matchMode: "prefix",
        },
      ],
    },
    {
      id: "package-database-docs",
      scopeRoot: "packages/_database/docs",
      ignorePatterns: [],
      rules: [
        {
          owner: "packages/_database:docs",
          root: "packages/_database/docs",
          kind: "owner-root",
          matchMode: "prefix",
        },
      ],
    },
    {
      id: "package-database-drizzle",
      scopeRoot: "packages/_database/drizzle",
      ignorePatterns: [],
      rules: [
        {
          owner: "packages/_database:drizzle",
          root: "packages/_database/drizzle",
          kind: "owner-root",
          matchMode: "prefix",
        },
      ],
    },
    {
      id: "package-database-scripts",
      scopeRoot: "packages/_database/scripts",
      ignorePatterns: [],
      rules: [
        {
          owner: "packages/_database:scripts",
          root: "packages/_database/scripts",
          kind: "owner-root",
          matchMode: "prefix",
        },
      ],
    },
    {
      id: "package-database-sql",
      scopeRoot: "packages/_database/sql",
      ignorePatterns: [],
      rules: [
        {
          owner: "packages/_database:sql",
          root: "packages/_database/sql",
          kind: "owner-root",
          matchMode: "prefix",
        },
      ],
    },
    {
      id: "package-database-src",
      scopeRoot: "packages/_database/src",
      ignorePatterns: [],
      rules: [
        {
          owner: "packages/_database:src",
          root: "packages/_database/src",
          kind: "owner-root",
          matchMode: "prefix",
        },
      ],
    },
  ],
  highConfidenceBackupPatterns: [
    /\.(?:bak|old|tmp)$/u,
    /\.(?:copy|orig)\.[^.]+$/u,
    /(?:^|[\\/]).*~$/u,
    /(?:^|[\\/]).*copy\.[^.]+$/u,
  ],
  warnStemTokens: ["final", "temp", "copy", "new"],
  protectedGeneratedPaths: [
    ".artifacts/reports/governance/governance-register.snapshot.json",
    "apps/web/scripts/i18n/data/*.json",
    "apps/web/src/app/_platform/i18n/audit/*.json",
    "docs/architecture/governance/generated/governance-register.md",
    "docs/README.md",
    "scripts/README.md",
  ],
  ignoredWorkingTreePaths: [
    ".artifacts/reports/governance/repo-integrity-guard.report.json",
    ".artifacts/reports/governance/repo-integrity-guard.report.md",
  ],
  reportMarkdownPath:
    ".artifacts/reports/governance/repo-integrity-guard.report.md",
  waiverRegistryPath: "rules/repo-integrity/repo-guard-waivers.json",
  waiverSoonToExpireDays: 14,
  boundaryImport: {
    sourceGlobs: [
      "apps/web/src/**/*.{ts,tsx}",
      "packages/*/src/**/*.{ts,tsx,js,mjs}",
    ],
    ignoredFileGlobs: [
      "**/__tests__/**",
      "**/*.test.ts",
      "**/*.test.tsx",
      "**/*.spec.ts",
      "**/*.spec.tsx",
      "**/*.stories.tsx",
      "**/*.d.ts",
    ],
    globalBlockedImportPatterns: [
      /^\.artifacts(?:\/|$)/u,
      /^\.turbo(?:\/|$)/u,
      /^node_modules(?:\/|$)/u,
      /^coverage(?:\/|$)/u,
    ],
    globalIgnoredImportPatterns: [/^\w[\w-]*$/u],
    rules: [
      {
        id: "RG-STRUCT-003",
        scopeRoot: "apps/web/src/marketing",
        blockedTargetPrefixes: [
          "apps/web/src/app/_features",
          "apps/web/src/routes",
          "apps/web/src/rpc",
        ],
        severity: "error",
        message:
          "Marketing must not depend on app feature, route, or RPC implementation roots.",
      },
      {
        id: "RG-STRUCT-003",
        scopeRoot: "apps/web/src/share",
        blockedTargetPrefixes: [
          "apps/web/src/app/_features",
          "apps/web/src/marketing",
          "apps/web/src/routes",
          "apps/web/src/rpc",
        ],
        severity: "error",
        message:
          "Shared code must not depend on feature, marketing, route, or RPC implementation roots.",
      },
      {
        id: "RG-STRUCT-003",
        scopeRoot: "apps/web/src/app/_components",
        blockedTargetPrefixes: [
          "apps/web/src/app/_features",
          "apps/web/src/marketing",
          "apps/web/src/routes",
          "apps/web/src/rpc",
        ],
        severity: "error",
        message:
          "App shared components must not depend on feature, marketing, route, or RPC implementation roots.",
      },
    ],
  },
  duplicateOverlap: {
    ignoredPathPatterns: [
      ".agents/**",
      ".legacy/**",
      "node_modules/**",
      ".artifacts/**",
      ".turbo/**",
      "coverage/**",
      "**/coverage/**",
      "dist/**",
      "**/dist/**",
    ],
    suspiciousVariantPatterns: [
      /(?:^|[-_.])(copy|final|draft|temp|old|new|v\d+)$/iu,
    ],
    scopes: [
      {
        id: "governed-docs",
        title: "Governed docs",
        fileGlobs: [
          "docs/architecture/governance/**/*.md",
          "docs/architecture/adr/**/*.md",
          "docs/architecture/atc/**/*.md",
        ],
        ignoredBasenames: ["readme"],
      },
      {
        id: "operational-scripts",
        title: "Operational scripts",
        fileGlobs: [
          "scripts/**/*.ts",
          "apps/web/scripts/**/*.ts",
          "packages/*/scripts/**/*.ts",
        ],
        ignoredBasenames: ["index"],
      },
    ],
  },
  strongerDocumentControl: {
    ignoredPathPatterns: [
      "docs/architecture/governance/README.md",
      "docs/architecture/governance/generated/**",
      "docs/architecture/adr/README.md",
      "docs/architecture/adr/ADR_TEMPLATE.md",
      "docs/architecture/atc/README.md",
      "docs/architecture/atc/ATC_TEMPLATE.md",
    ],
    scopes: [
      {
        id: "governance-doctrine",
        fileGlobs: ["docs/architecture/governance/*.md"],
        requiredFrontmatterKeys: [
          "title",
          "description",
          "status",
          "owner",
          "truthStatus",
          "docClass",
          "relatedDomain",
          "order",
        ],
        requiredContentPatterns: ["# "],
      },
      {
        id: "architecture-decisions",
        fileGlobs: ["docs/architecture/adr/ADR-*.md"],
        requiredFrontmatterKeys: [
          "owner",
          "truthStatus",
          "docClass",
          "relatedDomain",
        ],
        requiredContentPatterns: [
          "**Related governance domains:**",
          "**Related ATCs:**",
        ],
      },
      {
        id: "architecture-contracts",
        fileGlobs: ["docs/architecture/atc/ATC-*.md"],
        requiredFrontmatterKeys: [
          "title",
          "description",
          "status",
          "owner",
          "truthStatus",
          "docClass",
          "relatedDomain",
          "order",
        ],
        requiredContentPatterns: [
          "**Bound domain ID:**",
          "**Decision anchor:**",
        ],
      },
    ],
  },
  sourceEvidenceMismatch: {
    ignoredStatusPatterns: [
      ".artifacts/reports/governance/repo-integrity-guard.report.json",
      ".artifacts/reports/governance/repo-integrity-guard.report.md",
    ],
    bindings: [
      {
        id: "governance-register-refresh",
        sourcePathPatterns: [
          "scripts/afenda.config.json",
          "scripts/governance/generate-governance-register.ts",
          "scripts/lib/governance-spine.ts",
        ],
        evidencePathPatterns: [
          "docs/architecture/governance/generated/governance-register.md",
          ".artifacts/reports/governance/governance-register.snapshot.json",
        ],
        requiredEvidencePaths: [
          "docs/architecture/governance/generated/governance-register.md",
        ],
      },
      {
        id: "docs-operating-map-refresh",
        sourcePathPatterns: [
          "scripts/docs/generate-docs-readme.ts",
          "scripts/afenda.config.json",
          ".artifacts/reports/governance/governance-summary.report.json",
        ],
        evidencePathPatterns: ["docs/OPERATING_MAP.md"],
        requiredEvidencePaths: ["docs/OPERATING_MAP.md"],
      },
      {
        id: "repo-guard-architecture-discovery-surfaces",
        sourcePathPatterns: [
          "docs/architecture/adr/ADR-0008-repository-integrity-guard-architecture.md",
          "docs/architecture/adr/ADR-0009-cline-single-package-extraction-ready-boundaries.md",
          "docs/architecture/atc/ATC-0005-repository-integrity-guard-baseline.md",
          "docs/architecture/atc/ATC-0006-cline-package-boundaries-and-ownership.md",
          "docs/architecture/governance/REPOSITORY_INTEGRITY_GUARD.md",
          "docs/architecture/governance/REPO_GUARDRAIL_TODO.md",
        ],
        evidencePathPatterns: [
          "docs/architecture/adr/README.md",
          "docs/architecture/atc/README.md",
          "docs/architecture/governance/README.md",
        ],
        requiredEvidencePaths: [
          "docs/architecture/adr/README.md",
          "docs/architecture/atc/README.md",
        ],
      },
      {
        id: "design-system-component-governance",
        sourcePathPatterns: [
          "packages/design-system/ui-primitives/**/*.tsx",
          "packages/design-system/ui-primitives/**/*.manifest.ts",
          "packages/design-system/ui-primitives/_registry.ts",
        ],
        evidencePathPatterns: [
          "packages/design-system/generated/component-manifests.json",
          "packages/design-system/generated/component-variants.json",
          "packages/design-system/generated/component-coverage.json",
        ],
        requiredEvidencePaths: [
          "packages/design-system/generated/component-manifests.json",
          "packages/design-system/generated/component-variants.json",
          "packages/design-system/generated/component-coverage.json",
        ],
      },
      {
        id: "database-schema-inventory",
        sourcePathPatterns: [
          "packages/_database/scripts/sync-schema-inventory.ts",
          "packages/_database/src/schema/**/*.ts",
          "packages/_database/src/7w1h-audit/**/*.ts",
        ],
        evidencePathPatterns: [
          "packages/_database/docs/guideline/schema-inventory.json",
        ],
        requiredEvidencePaths: [
          "packages/_database/docs/guideline/schema-inventory.json",
        ],
      },
      {
        id: "database-glossary-enum-sync",
        sourcePathPatterns: [
          "packages/_database/scripts/sync-glossary-enums.ts",
          "packages/_database/src/studio/pg-enum-allowlist.ts",
          "packages/_database/src/schema/shared/enums.schema.ts",
          "packages/_database/src/schema/iam/auth-challenges.schema.ts",
          "packages/_database/src/7w1h-audit/audit-enums.schema.ts",
        ],
        evidencePathPatterns: [
          "packages/_database/src/studio/business-glossary.snapshot.json",
        ],
        requiredEvidencePaths: [
          "packages/_database/src/studio/business-glossary.snapshot.json",
        ],
      },
    ],
  },
  generatedAuthenticity: {
    bindings: [
      {
        id: "governance-register-markdown",
        kind: "governance-register-markdown",
        targetPath:
          "docs/architecture/governance/generated/governance-register.md",
        requiredSources: [
          "scripts/afenda.config.json",
          ".artifacts/reports/governance/governance-core.report.json",
        ],
      },
      {
        id: "governance-register-snapshot",
        kind: "governance-register-snapshot",
        targetPath:
          ".artifacts/reports/governance/governance-register.snapshot.json",
        requiredSources: [
          "scripts/afenda.config.json",
          ".artifacts/reports/governance/governance-core.report.json",
        ],
      },
      {
        id: "design-system-component-manifests",
        kind: "design-system-component-governance",
        artifact: "manifests",
        targetPath: "packages/design-system/generated/component-manifests.json",
        requiredSources: [
          "packages/design-system/scripts/component-governance/core.ts",
          "packages/design-system/scripts/component-governance/generate.ts",
          "packages/design-system/ui-primitives/_registry.ts",
          "packages/design-system/ui-primitives",
        ],
      },
      {
        id: "design-system-component-variants",
        kind: "design-system-component-governance",
        artifact: "variants",
        targetPath: "packages/design-system/generated/component-variants.json",
        requiredSources: [
          "packages/design-system/scripts/component-governance/core.ts",
          "packages/design-system/scripts/component-governance/generate.ts",
          "packages/design-system/ui-primitives/_registry.ts",
          "packages/design-system/ui-primitives",
        ],
      },
      {
        id: "design-system-component-coverage",
        kind: "design-system-component-governance",
        artifact: "coverage",
        targetPath: "packages/design-system/generated/component-coverage.json",
        requiredSources: [
          "packages/design-system/scripts/component-governance/core.ts",
          "packages/design-system/scripts/component-governance/generate.ts",
          "packages/design-system/ui-primitives/_registry.ts",
          "packages/design-system/ui-primitives",
        ],
      },
      {
        id: "database-schema-inventory",
        kind: "database-schema-inventory",
        targetPath: "packages/_database/docs/guideline/schema-inventory.json",
        requiredSources: [
          "packages/_database/scripts/sync-schema-inventory.ts",
          "packages/_database/src/schema",
          "packages/_database/src/7w1h-audit",
        ],
      },
      {
        id: "database-glossary-snapshot",
        kind: "database-glossary-snapshot",
        targetPath:
          "packages/_database/src/studio/business-glossary.snapshot.json",
        requiredSources: [
          "packages/_database/scripts/sync-glossary-enums.ts",
          "packages/_database/src/studio/pg-enum-allowlist.ts",
          "packages/_database/src/schema/shared/enums.schema.ts",
          "packages/_database/src/schema/iam/auth-challenges.schema.ts",
          "packages/_database/src/7w1h-audit/audit-enums.schema.ts",
        ],
      },
    ],
    orphanRoots: [
      {
        root: "docs/architecture/governance/generated",
        allowedGeneratedPaths: [
          "docs/architecture/governance/generated/README.md",
          "docs/architecture/governance/generated/governance-register.md",
        ],
      },
      {
        root: "packages/design-system/generated",
        allowedGeneratedPaths: [
          "packages/design-system/generated/component-manifests.json",
          "packages/design-system/generated/component-variants.json",
          "packages/design-system/generated/component-coverage.json",
          "packages/design-system/generated/schemas/component-manifests.schema.json",
          "packages/design-system/generated/schemas/component-variants.schema.json",
          "packages/design-system/generated/schemas/component-coverage.schema.json",
        ],
      },
    ],
  },
} as const
