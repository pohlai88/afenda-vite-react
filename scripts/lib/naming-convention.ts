import fs from "node:fs"
import path from "node:path"

export interface NamingConventionIssue {
  readonly severity: "error" | "warn"
  readonly rule: string
  readonly path: string
  readonly message: string
}

export interface NamingConventionResult {
  readonly errors: readonly NamingConventionIssue[]
  readonly warnings: readonly NamingConventionIssue[]
}

export interface NamingGovernedRootDefinition {
  readonly id: string
  readonly relativeRoot: string
  readonly includePatterns: readonly string[]
  readonly excludePatterns: readonly string[]
  readonly namingFamilies: readonly string[]
  readonly allowedIndexBoundaries: readonly string[]
  readonly testNamingRules: readonly string[]
  readonly deliverableFamilies: readonly string[]
}

interface NamingConventionEvaluationContext {
  readonly repoRoot: string
  readonly rootPackageScripts: Record<string, string>
}

interface NamingGovernedRoot extends NamingGovernedRootDefinition {
  readonly evaluate: (
    context: NamingConventionEvaluationContext,
    issues: NamingConventionIssue[]
  ) => void
}

const APPROVED_ROOT_SCRIPT_VERBS = new Set([
  "check",
  "generate",
  "run",
  "validate",
  "sync",
  "inspect",
])

const ROLE_SUFFIXES = new Set([
  "test",
  "spec",
  "stories",
  "schema",
  "contract",
  "policy",
  "adapter",
  "provider",
  "store",
])

const BANNED_GENERIC_SUBJECTS = new Set([
  "section",
  "component",
  "panel",
  "data",
  "file",
  "utils",
  "helpers",
  "common",
  "final",
  "new",
  "temp",
  "copy",
  "test",
])

const EMPTY_ROLE_SUBJECTS = new Set([
  "schema",
  "contract",
  "policy",
  "store",
  "provider",
])

const ADR_FILE_PATTERN = /^ADR-\d{4}-[a-z0-9]+(?:-[a-z0-9]+)*\.md$/u
const ATC_FILE_PATTERN = /^ATC-\d{4}-[a-z0-9]+(?:-[a-z0-9]+)*\.md$/u
const ROOT_SCRIPT_ENTRYPOINT_PATTERN = new RegExp(
  `^(?:${[...APPROVED_ROOT_SCRIPT_VERBS].join("|")})-[a-z0-9]+(?:-[a-z0-9]+)+$`,
  "u"
)
const LOCAL_SCRIPT_ENTRYPOINT_PATTERN = new RegExp(
  `^(?:${[...APPROVED_ROOT_SCRIPT_VERBS].join("|")})-[a-z0-9]+(?:-[a-z0-9]+)*\\.ts$`,
  "u"
)
const PACKAGE_LOCAL_SCRIPT_ENTRYPOINT_PATTERN =
  /^(?:apply|build|check|codemod|ensure|generate|guard|inspect|pick|run|sync|validate|verify)-[a-z0-9]+(?:-[a-z0-9]+)*\.(?:ts|mjs)$/u
const KEBAB_CASE_STEM_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u
const LOWER_ROLE_STEM_PATTERN =
  /^[a-z0-9]+(?:-[a-z0-9]+)*(?:\.[a-z0-9]+(?:-[a-z0-9]+)*)*$/u
const TEST_FILE_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*\.test\.tsx?$/u
const PACKAGE_TEST_FILE_PATTERN =
  /^[a-z0-9]+(?:-[a-z0-9]+)*(?:\.[a-z0-9]+(?:-[a-z0-9]+)*)*\.test\.tsx?$/u
const MACHINE_NOISE_EXCLUDE_PATTERNS = [
  "node_modules/**",
  ".artifacts/**",
  ".turbo/**",
  "coverage/**",
  "**/coverage/**",
  "tmp/**",
  "temp/**",
  ".cache/**",
] as const

const NAMING_GOVERNED_ROOTS: readonly NamingGovernedRoot[] = [
  createNamingGovernedRoot(
    {
      id: "scripts-root",
      relativeRoot: "scripts",
      includePatterns: ["scripts/*.{ts,tsx,md}"],
      namingFamilies: ["root-script-entrypoint", "root-script-doc"],
      allowedIndexBoundaries: [],
      testNamingRules: [],
      deliverableFamilies: [],
    },
    (context, issues) =>
      evaluateScriptsRoot(context.repoRoot, context.rootPackageScripts, issues)
  ),
  createNamingGovernedRoot(
    {
      id: "governance-docs",
      relativeRoot: "docs/architecture/governance",
      includePatterns: ["docs/architecture/governance/*.md"],
      namingFamilies: ["governance-doc"],
      allowedIndexBoundaries: [],
      testNamingRules: [],
      deliverableFamilies: [],
    },
    (context, issues) => evaluateGovernanceDocs(context.repoRoot, issues)
  ),
  createNamingGovernedRoot(
    {
      id: "adr-docs",
      relativeRoot: "docs/architecture/adr",
      includePatterns: ["docs/architecture/adr/*.md"],
      namingFamilies: ["adr-doc"],
      allowedIndexBoundaries: [],
      testNamingRules: [],
      deliverableFamilies: [],
    },
    (context, issues) => evaluateAdrDocs(context.repoRoot, issues)
  ),
  createNamingGovernedRoot(
    {
      id: "atc-docs",
      relativeRoot: "docs/architecture/atc",
      includePatterns: ["docs/architecture/atc/*.md"],
      namingFamilies: ["atc-doc"],
      allowedIndexBoundaries: [],
      testNamingRules: [],
      deliverableFamilies: [],
    },
    (context, issues) => evaluateAtcDocs(context.repoRoot, issues)
  ),
  createNamingGovernedRoot(
    {
      id: "web-platform-i18n",
      relativeRoot: "apps/web/src/app/_platform/i18n",
      includePatterns: [
        "apps/web/src/app/_platform/i18n/components/*.{ts,tsx}",
        "apps/web/src/app/_platform/i18n/adapters/*.ts",
        "apps/web/src/app/_platform/i18n/services/*.ts",
        "apps/web/src/app/_platform/i18n/policy/*.{ts,json}",
        "apps/web/src/app/_platform/i18n/scripts/*.ts",
        "apps/web/src/app/_platform/i18n/types/*.d.ts",
        "apps/web/src/app/_platform/i18n/__tests__/*.{ts,tsx}",
      ],
      namingFamilies: [
        "kebab-component",
        "adapter-suffix",
        "service-suffix",
        "policy-suffix",
        "local-script-verb-first",
        "types-suffix",
      ],
      allowedIndexBoundaries: ["apps/web/src/app/_platform/i18n/index.ts"],
      testNamingRules: ["<subject>.test.ts[x]"],
      deliverableFamilies: ["policy-json"],
    },
    (context, issues) => evaluateWebPlatformI18nRoot(context.repoRoot, issues)
  ),
  createNamingGovernedRoot(
    {
      id: "web-platform-runtime",
      relativeRoot: "apps/web/src/app/_platform/runtime",
      includePatterns: [
        "apps/web/src/app/_platform/runtime/components/*.{ts,tsx}",
        "apps/web/src/app/_platform/runtime/adapters/*.ts",
        "apps/web/src/app/_platform/runtime/hooks/*.{ts,tsx}",
        "apps/web/src/app/_platform/runtime/policy/*.ts",
        "apps/web/src/app/_platform/runtime/scripts/*.ts",
        "apps/web/src/app/_platform/runtime/services/*.ts",
        "apps/web/src/app/_platform/runtime/types/*.{ts,d.ts}",
        "apps/web/src/app/_platform/runtime/__tests__/*.{ts,tsx}",
      ],
      namingFamilies: [
        "kebab-component",
        "adapter-suffix",
        "hook-prefix",
        "policy-suffix",
        "local-script-verb-first",
        "service-suffix",
        "types-suffix",
      ],
      allowedIndexBoundaries: ["apps/web/src/app/_platform/runtime/index.ts"],
      testNamingRules: ["<subject>.test.ts[x]"],
      deliverableFamilies: [],
    },
    (context, issues) =>
      evaluateWebPlatformRuntimeRoot(context.repoRoot, issues)
  ),
  createNamingGovernedRoot(
    {
      id: "web-platform-tenant",
      relativeRoot: "apps/web/src/app/_platform/tenant",
      includePatterns: ["apps/web/src/app/_platform/tenant/*.{ts,tsx}"],
      namingFamilies: ["kebab-root", "context-suffix", "types-suffix"],
      allowedIndexBoundaries: ["apps/web/src/app/_platform/tenant/index.ts"],
      testNamingRules: [],
      deliverableFamilies: [],
    },
    (context, issues) => evaluateWebPlatformTenantRoot(context.repoRoot, issues)
  ),
  createNamingGovernedRoot(
    {
      id: "web-platform-theme",
      relativeRoot: "apps/web/src/app/_platform/theme",
      includePatterns: [
        "apps/web/src/app/_platform/theme/*.{ts,tsx}",
        "apps/web/src/app/_platform/theme/__tests__/*.{ts,tsx}",
      ],
      namingFamilies: ["theme-react-role", "theme-script-role", "hook-prefix"],
      allowedIndexBoundaries: ["apps/web/src/app/_platform/theme/index.ts"],
      testNamingRules: ["<subject>.test.ts[x]"],
      deliverableFamilies: [],
    },
    (context, issues) => evaluateWebPlatformThemeRoot(context.repoRoot, issues)
  ),
  createNamingGovernedRoot(
    {
      id: "web-platform-config",
      relativeRoot: "apps/web/src/app/_platform/config",
      includePatterns: ["apps/web/src/app/_platform/config/*.{ts,tsx}"],
      namingFamilies: ["config-env-suffix"],
      allowedIndexBoundaries: ["apps/web/src/app/_platform/config/index.ts"],
      testNamingRules: [],
      deliverableFamilies: [],
    },
    (context, issues) => evaluateWebPlatformConfigRoot(context.repoRoot, issues)
  ),
  createNamingGovernedRoot(
    {
      id: "web-platform-app-surface",
      relativeRoot: "apps/web/src/app/_platform/app-surface",
      includePatterns: ["apps/web/src/app/_platform/app-surface/**/*.{ts,tsx}"],
      namingFamilies: [
        "kebab-component",
        "contract-suffix",
        "verb-first-service",
      ],
      allowedIndexBoundaries: [
        "apps/web/src/app/_platform/app-surface/index.ts",
      ],
      testNamingRules: ["<subject>.test.ts[x]"],
      deliverableFamilies: [],
    },
    (context, issues) =>
      evaluateWebPlatformAppSurfaceRoot(context.repoRoot, issues)
  ),
  createNamingGovernedRoot(
    {
      id: "web-platform-auth",
      relativeRoot: "apps/web/src/app/_platform/auth",
      includePatterns: ["apps/web/src/app/_platform/auth/**/*.{ts,tsx,css}"],
      namingFamilies: [
        "auth-client-root",
        "kebab-component",
        "contract-lower-role",
        "require-guard",
        "hook-prefix",
        "map-prefix",
        "route-prefix",
        "service-suffix",
      ],
      allowedIndexBoundaries: ["apps/web/src/app/_platform/auth/index.ts"],
      testNamingRules: ["<subject>.test.ts[x]"],
      deliverableFamilies: ["auth-css"],
    },
    (context, issues) => evaluateWebPlatformAuthRoot(context.repoRoot, issues)
  ),
  createNamingGovernedRoot(
    {
      id: "web-platform-shell",
      relativeRoot: "apps/web/src/app/_platform/shell",
      includePatterns: ["apps/web/src/app/_platform/shell/**/*.{ts,tsx,md}"],
      namingFamilies: [
        "kebab-root",
        "shell-component-kebab",
        "hook-prefix",
        "policy-suffix",
        "registry-suffix",
        "local-script-verb-first",
        "store-suffix",
      ],
      allowedIndexBoundaries: [
        "apps/web/src/app/_platform/shell/index.ts",
        "apps/web/src/app/_platform/shell/components/shell-left-sidebar-block/index.ts",
      ],
      testNamingRules: ["<subject>.test.ts[x]"],
      deliverableFamilies: ["shell-readme"],
    },
    (context, issues) => evaluateWebPlatformShellRoot(context.repoRoot, issues)
  ),
  createNamingGovernedRoot(
    {
      id: "web-app-components",
      relativeRoot: "apps/web/src/app/_components",
      includePatterns: ["apps/web/src/app/_components/**/*.{ts,tsx}"],
      namingFamilies: ["lower-role", "test-suffix"],
      allowedIndexBoundaries: [
        "apps/web/src/app/_components/index.ts",
        "apps/web/src/app/_components/app-states/index.ts",
      ],
      testNamingRules: ["<subject>.test.ts[x]"],
      deliverableFamilies: [],
    },
    (context, issues) => evaluateAppComponentsRoot(context.repoRoot, issues)
  ),
  createNamingGovernedRoot(
    {
      id: "web-app-features",
      relativeRoot: "apps/web/src/app/_features",
      includePatterns: ["apps/web/src/app/_features/**/*.{ts,tsx,md}"],
      namingFamilies: [
        "lower-role",
        "kebab-component",
        "hook-prefix",
        "local-script-verb-first",
      ],
      allowedIndexBoundaries: [
        "apps/web/src/app/_features/*/index.ts",
        "apps/web/src/app/_features/*/actions/index.ts",
        "apps/web/src/app/_features/*/hooks/index.ts",
      ],
      testNamingRules: ["<subject>.test.ts[x]"],
      deliverableFamilies: ["feature-readme"],
    },
    (context, issues) => evaluateAppFeaturesRoot(context.repoRoot, issues)
  ),
  createNamingGovernedRoot(
    {
      id: "web-routes",
      relativeRoot: "apps/web/src/routes",
      includePatterns: ["apps/web/src/routes/**/*.{ts,tsx,md}"],
      namingFamilies: ["route-prefix", "kebab-helper", "test-suffix"],
      allowedIndexBoundaries: ["apps/web/src/routes/index.ts"],
      testNamingRules: ["<subject>.test.ts[x]"],
      deliverableFamilies: ["routes-readme"],
    },
    (context, issues) => evaluateWebRoutesRoot(context.repoRoot, issues)
  ),
  createNamingGovernedRoot(
    {
      id: "web-share",
      relativeRoot: "apps/web/src/share",
      includePatterns: ["apps/web/src/share/**/*.{ts,tsx}"],
      namingFamilies: ["path-aware-kebab", "test-suffix"],
      allowedIndexBoundaries: [],
      testNamingRules: ["<subject>.test.ts[x]"],
      deliverableFamilies: [],
    },
    (context, issues) => evaluateWebShareRoot(context.repoRoot, issues)
  ),
  createNamingGovernedRoot(
    {
      id: "web-rpc",
      relativeRoot: "apps/web/src/rpc",
      includePatterns: ["apps/web/src/rpc/**/*.{ts,tsx}"],
      namingFamilies: ["web-rpc-module"],
      allowedIndexBoundaries: ["apps/web/src/rpc/index.ts"],
      testNamingRules: ["<subject>.test.ts[x]"],
      deliverableFamilies: [],
    },
    (context, issues) => evaluateWebRpcRoot(context.repoRoot, issues)
  ),
  createNamingGovernedRoot(
    {
      id: "web-marketing",
      relativeRoot: "apps/web/src/marketing",
      includePatterns: ["apps/web/src/marketing/**/*.{ts,tsx,md,json,css}"],
      namingFamilies: [
        "marketing-root",
        "marketing-component",
        "marketing-page",
        "marketing-landing",
      ],
      allowedIndexBoundaries: ["apps/web/src/marketing/components/index.ts"],
      testNamingRules: ["<subject>.test.ts[x]"],
      deliverableFamilies: ["marketing-readme", "marketing-css"],
    },
    (context, issues) => evaluateWebMarketingRoot(context.repoRoot, issues)
  ),
  createNamingGovernedRoot(
    {
      id: "pkg-contracts",
      relativeRoot: "packages/contracts/src",
      includePatterns: ["packages/contracts/src/**/*.ts"],
      namingFamilies: ["public-index-only"],
      allowedIndexBoundaries: ["packages/contracts/src/index.ts"],
      testNamingRules: [],
      deliverableFamilies: [],
    },
    (context, issues) => evaluateContractsPackageRoot(context.repoRoot, issues)
  ),
  createNamingGovernedRoot(
    {
      id: "pkg-env-loader",
      relativeRoot: "packages/env-loader/src",
      includePatterns: ["packages/env-loader/src/**/*.ts"],
      namingFamilies: ["public-index-only"],
      allowedIndexBoundaries: ["packages/env-loader/src/index.ts"],
      testNamingRules: [],
      deliverableFamilies: [],
    },
    (context, issues) => evaluateEnvLoaderPackageRoot(context.repoRoot, issues)
  ),
  createNamingGovernedRoot(
    {
      id: "pkg-pino-logger",
      relativeRoot: "packages/pino-logger/src",
      includePatterns: ["packages/pino-logger/src/**/*.ts"],
      namingFamilies: ["lower-role", "package-test-suffix"],
      allowedIndexBoundaries: ["packages/pino-logger/src/index.ts"],
      testNamingRules: ["<subject>[.<role>].test.ts"],
      deliverableFamilies: [],
    },
    (context, issues) => evaluatePinoLoggerPackageRoot(context.repoRoot, issues)
  ),
  createNamingGovernedRoot(
    {
      id: "pkg-better-auth",
      relativeRoot: "packages/better-auth",
      includePatterns: [
        "packages/better-auth/src/**/*.ts",
        "packages/better-auth/scripts/*.{ts,mjs}",
      ],
      namingFamilies: [
        "lower-role",
        "generated-ts",
        "package-local-script",
        "package-test-suffix",
      ],
      allowedIndexBoundaries: [
        "packages/better-auth/src/index.ts",
        "packages/better-auth/src/schema/index.ts",
      ],
      testNamingRules: ["<subject>[.<role>].test.ts"],
      deliverableFamilies: ["generated-ts"],
    },
    (context, issues) => evaluateBetterAuthPackageRoot(context.repoRoot, issues)
  ),
  createNamingGovernedRoot(
    {
      id: "pkg-vitest-config",
      relativeRoot: "packages/vitest-config",
      includePatterns: [
        "packages/vitest-config/src/**/*.ts",
        "packages/vitest-config/dist/**/*.{js,ts,map}",
      ],
      namingFamilies: ["lower-role", "package-test-suffix", "dist-artifact"],
      allowedIndexBoundaries: [],
      testNamingRules: ["<subject>[.<role>].test.ts"],
      deliverableFamilies: ["dist-js", "dist-dts", "dist-dts-map"],
    },
    (context, issues) =>
      evaluateVitestConfigPackageRoot(context.repoRoot, issues)
  ),
  createNamingGovernedRoot(
    {
      id: "pkg-eslint-config",
      relativeRoot: "packages/eslint-config/src",
      includePatterns: ["packages/eslint-config/src/**/*.{js,md}"],
      namingFamilies: ["eslint-js", "eslint-rule", "package-test-suffix"],
      allowedIndexBoundaries: [
        "packages/eslint-config/src/index.js",
        "packages/eslint-config/src/plugin.js",
      ],
      testNamingRules: ["<subject>[.<role>].test.js"],
      deliverableFamilies: [],
    },
    (context, issues) =>
      evaluateEslintConfigPackageRoot(context.repoRoot, issues)
  ),
  createNamingGovernedRoot(
    {
      id: "pkg-design-system",
      relativeRoot: "packages/design-system",
      includePatterns: [
        "packages/design-system/hooks/**/*.ts",
        "packages/design-system/icons/**/*.{ts,tsx,md}",
        "packages/design-system/ui-primitives/**/*.{ts,tsx,md}",
        "packages/design-system/utils/**/*.{ts,md}",
        "packages/design-system/generated/**/*.{json}",
        "packages/design-system/scripts/**/*.{ts,tsx}",
        "packages/design-system/design-architecture/**/*.{css,md,ts}",
      ],
      namingFamilies: [
        "hook-prefix",
        "icon-family",
        "manifest-family",
        "generated-json-family",
        "package-local-script",
      ],
      allowedIndexBoundaries: [
        "packages/design-system/hooks/index.ts",
        "packages/design-system/icons/index.ts",
        "packages/design-system/ui-primitives/index.ts",
        "packages/design-system/utils/index.ts",
        "packages/design-system/index.ts",
      ],
      testNamingRules: ["<subject>[.<role>].test.ts[x]"],
      deliverableFamilies: ["generated-json", "schema-json"],
    },
    (context, issues) =>
      evaluateDesignSystemPackageRoot(context.repoRoot, issues)
  ),
  createNamingGovernedRoot(
    {
      id: "pkg-database",
      relativeRoot: "packages/_database",
      includePatterns: [
        "packages/_database/scripts/*.ts",
        "packages/_database/sql/**/*.sql",
        "packages/_database/drizzle/**/*.{sql,json}",
        "packages/_database/src/**/*.{ts,tsx,json,md,txt}",
      ],
      namingFamilies: [
        "package-local-script",
        "sql-patch-family",
        "drizzle-migration-family",
        "schema-family",
        "snapshot-family",
      ],
      allowedIndexBoundaries: [
        "packages/_database/src/index.ts",
        "packages/_database/src/7w1h-audit/index.ts",
        "packages/_database/src/migrations/index.ts",
        "packages/_database/src/queries/index.ts",
        "packages/_database/src/schema/index.ts",
        "packages/_database/src/schema/environment-support/index.ts",
        "packages/_database/src/schema/finance/index.ts",
        "packages/_database/src/schema/governance/index.ts",
        "packages/_database/src/schema/iam/index.ts",
        "packages/_database/src/schema/identity/index.ts",
        "packages/_database/src/schema/mdm/index.ts",
        "packages/_database/src/schema/pkg-governance/index.ts",
        "packages/_database/src/schema/ref/index.ts",
        "packages/_database/src/schema/shared/index.ts",
        "packages/_database/src/schema/tenancy/index.ts",
        "packages/_database/src/studio/index.ts",
        "packages/_database/src/views/index.ts",
      ],
      testNamingRules: ["<subject>[.<role>].test.ts[x]"],
      deliverableFamilies: ["snapshot-json", "schema-json", "sql-patch"],
    },
    (context, issues) => evaluateDatabasePackageRoot(context.repoRoot, issues)
  ),
] as const

export function getNamingGovernedRoots(): readonly NamingGovernedRootDefinition[] {
  return NAMING_GOVERNED_ROOTS.map(
    ({
      id,
      relativeRoot,
      includePatterns,
      excludePatterns,
      namingFamilies,
      allowedIndexBoundaries,
      testNamingRules,
      deliverableFamilies,
    }) => ({
      id,
      relativeRoot,
      includePatterns,
      excludePatterns,
      namingFamilies,
      allowedIndexBoundaries,
      testNamingRules,
      deliverableFamilies,
    })
  )
}

export function evaluateNamingConvention(
  repoRoot: string,
  rootPackageScripts: Record<string, string>
): NamingConventionResult {
  const issues: NamingConventionIssue[] = []
  const context: NamingConventionEvaluationContext = {
    repoRoot,
    rootPackageScripts,
  }

  for (const governedRoot of NAMING_GOVERNED_ROOTS) {
    governedRoot.evaluate(context, issues)
  }

  return {
    errors: issues.filter((issue) => issue.severity === "error"),
    warnings: issues.filter((issue) => issue.severity === "warn"),
  }
}

function createNamingGovernedRoot(
  definition: Omit<NamingGovernedRootDefinition, "excludePatterns"> & {
    readonly excludePatterns?: readonly string[]
  },
  evaluate: NamingGovernedRoot["evaluate"]
): NamingGovernedRoot {
  return {
    ...definition,
    excludePatterns:
      definition.excludePatterns ?? MACHINE_NOISE_EXCLUDE_PATTERNS,
    evaluate,
  }
}

function evaluateScriptsRoot(
  repoRoot: string,
  rootPackageScripts: Record<string, string>,
  issues: NamingConventionIssue[]
) {
  const scriptsRoot = path.join(repoRoot, "scripts")
  if (!fs.existsSync(scriptsRoot)) {
    return
  }
  const files = fs
    .readdirSync(scriptsRoot, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)

  const rootEntrypointFiles = getRootEntrypointFiles(rootPackageScripts)

  for (const fileName of files) {
    const relativePath = toPosixPath(path.join("scripts", fileName))

    if (fileName === "index.ts" || fileName === "index.tsx") {
      issues.push({
        severity: "warn",
        rule: "suspicious-index",
        path: relativePath,
        message:
          "Root/global naming should avoid index entrypoints unless they are clearly documented public boundaries.",
      })
    }

    if (!/\.(?:ts|tsx|md)$/u.test(fileName)) {
      continue
    }

    evaluateGenericAndRoleOnlyName(fileName, relativePath, issues)

    if (rootEntrypointFiles.has(fileName)) {
      const stem = stripExtension(fileName)
      if (!ROOT_SCRIPT_ENTRYPOINT_PATTERN.test(stem)) {
        issues.push({
          severity: "error",
          rule: "root-script-verb-first",
          path: relativePath,
          message:
            'Root script entrypoints must use "<action>-<domain>-<target>" form and start with an approved verb.',
        })
      }
    }
  }
}

function evaluateGovernanceDocs(
  repoRoot: string,
  issues: NamingConventionIssue[]
) {
  const governanceRoot = path.join(
    repoRoot,
    "docs",
    "architecture",
    "governance"
  )
  if (!fs.existsSync(governanceRoot)) {
    return
  }
  const files = fs
    .readdirSync(governanceRoot, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)

  for (const fileName of files) {
    if (!fileName.endsWith(".md") || fileName === "README.md") {
      continue
    }

    const relativePath = toPosixPath(
      path.join("docs", "architecture", "governance", fileName)
    )
    evaluateGenericAndRoleOnlyName(fileName, relativePath, issues)
  }
}

function evaluateAdrDocs(repoRoot: string, issues: NamingConventionIssue[]) {
  const adrRoot = path.join(repoRoot, "docs", "architecture", "adr")
  if (!fs.existsSync(adrRoot)) {
    return
  }
  const files = fs
    .readdirSync(adrRoot, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)

  for (const fileName of files) {
    if (!fileName.endsWith(".md")) {
      continue
    }

    const relativePath = toPosixPath(
      path.join("docs", "architecture", "adr", fileName)
    )

    if (fileName === "README.md" || fileName === "ADR_TEMPLATE.md") {
      continue
    }

    if (!ADR_FILE_PATTERN.test(fileName)) {
      issues.push({
        severity: "error",
        rule: "adr-file-name",
        path: relativePath,
        message:
          'ADR filenames must use "ADR-<id>-<context>-<purpose>.md" form.',
      })
      continue
    }

    evaluateGenericAndRoleOnlyName(fileName, relativePath, issues)
  }
}

function evaluateAtcDocs(repoRoot: string, issues: NamingConventionIssue[]) {
  const atcRoot = path.join(repoRoot, "docs", "architecture", "atc")
  if (!fs.existsSync(atcRoot)) {
    return
  }
  const files = fs
    .readdirSync(atcRoot, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)

  for (const fileName of files) {
    if (!fileName.endsWith(".md")) {
      continue
    }

    const relativePath = toPosixPath(
      path.join("docs", "architecture", "atc", fileName)
    )

    if (fileName === "README.md" || fileName === "ATC_TEMPLATE.md") {
      continue
    }

    if (!ATC_FILE_PATTERN.test(fileName)) {
      issues.push({
        severity: "error",
        rule: "atc-file-name",
        path: relativePath,
        message:
          'ATC filenames must use "ATC-<id>-<context>-<purpose>.md" form.',
      })
      continue
    }

    evaluateGenericAndRoleOnlyName(fileName, relativePath, issues)
  }
}

function evaluateWebPlatformI18nRoot(
  repoRoot: string,
  issues: NamingConventionIssue[]
) {
  const i18nRoot = path.join(
    repoRoot,
    "apps",
    "web",
    "src",
    "app",
    "_platform",
    "i18n"
  )
  if (!fs.existsSync(i18nRoot)) {
    return
  }

  evaluateWebPlatformI18nDirectory(
    path.join(i18nRoot, "components"),
    "apps/web/src/app/_platform/i18n/components",
    issues,
    (fileName, relativePath) => {
      if (!/\.(?:ts|tsx)$/u.test(fileName)) {
        return
      }

      if (!KEBAB_CASE_STEM_PATTERN.test(stripExtension(fileName))) {
        issues.push({
          severity: "error",
          rule: "i18n-component-kebab-case",
          path: relativePath,
          message:
            "i18n component filenames must use kebab-case within the bounded Phase 2 naming domain.",
        })
      }
    }
  )

  evaluateWebPlatformI18nDirectory(
    path.join(i18nRoot, "adapters"),
    "apps/web/src/app/_platform/i18n/adapters",
    issues,
    (fileName, relativePath) => {
      if (!fileName.endsWith(".ts")) {
        return
      }

      if (!fileName.endsWith("-adapter.ts")) {
        issues.push({
          severity: "error",
          rule: "i18n-adapter-suffix",
          path: relativePath,
          message:
            'i18n adapter filenames must end with "-adapter.ts" in the bounded Phase 2 naming domain.',
        })
      }
    }
  )

  evaluateWebPlatformI18nDirectory(
    path.join(i18nRoot, "services"),
    "apps/web/src/app/_platform/i18n/services",
    issues,
    (fileName, relativePath) => {
      if (!fileName.endsWith(".ts")) {
        return
      }

      if (!fileName.endsWith("-service.ts")) {
        issues.push({
          severity: "error",
          rule: "i18n-service-suffix",
          path: relativePath,
          message:
            'i18n service filenames must end with "-service.ts" in the bounded Phase 2 naming domain.',
        })
      }
    }
  )

  evaluateWebPlatformI18nDirectory(
    path.join(i18nRoot, "policy"),
    "apps/web/src/app/_platform/i18n/policy",
    issues,
    (fileName, relativePath) => {
      if (fileName.endsWith(".ts") && !fileName.endsWith("-policy.ts")) {
        issues.push({
          severity: "error",
          rule: "i18n-policy-suffix",
          path: relativePath,
          message:
            'i18n policy modules must end with "-policy.ts" in the bounded Phase 2 naming domain.',
        })
      }

      if (fileName.endsWith(".json")) {
        const stem = stripExtension(fileName)
        if (!KEBAB_CASE_STEM_PATTERN.test(stem)) {
          issues.push({
            severity: "error",
            rule: "i18n-policy-json-kebab-case",
            path: relativePath,
            message:
              "i18n policy JSON artifacts must use kebab-case filenames in the bounded Phase 2 naming domain.",
          })
        }
      }
    }
  )

  evaluateWebPlatformI18nDirectory(
    path.join(i18nRoot, "scripts"),
    "apps/web/src/app/_platform/i18n/scripts",
    issues,
    (fileName, relativePath) => {
      if (!fileName.endsWith(".ts")) {
        return
      }

      if (!LOCAL_SCRIPT_ENTRYPOINT_PATTERN.test(fileName)) {
        issues.push({
          severity: "error",
          rule: "i18n-script-verb-first",
          path: relativePath,
          message:
            'Local i18n scripts must start with an approved verb and use "<action>-<subject>" naming.',
        })
      }
    }
  )

  evaluateWebPlatformI18nDirectory(
    path.join(i18nRoot, "types"),
    "apps/web/src/app/_platform/i18n/types",
    issues,
    (fileName, relativePath) => {
      if (!fileName.endsWith(".d.ts")) {
        return
      }

      if (!fileName.endsWith("-types.d.ts")) {
        issues.push({
          severity: "error",
          rule: "i18n-types-suffix",
          path: relativePath,
          message:
            'i18n declaration files must end with "-types.d.ts" in the bounded Phase 2 naming domain.',
        })
      }
    }
  )

  evaluateWebPlatformI18nDirectory(
    path.join(i18nRoot, "__tests__"),
    "apps/web/src/app/_platform/i18n/__tests__",
    issues,
    (fileName, relativePath) => {
      if (!/\.(?:ts|tsx)$/u.test(fileName)) {
        return
      }

      if (!TEST_FILE_PATTERN.test(fileName)) {
        issues.push({
          severity: "error",
          rule: "i18n-test-suffix",
          path: relativePath,
          message:
            'i18n unit and integration tests must use "<subject>.test.ts[x]" naming in the bounded Phase 2 naming domain.',
        })
      }
    }
  )
}

function evaluateWebPlatformRuntimeRoot(
  repoRoot: string,
  issues: NamingConventionIssue[]
) {
  const runtimeRoot = path.join(
    repoRoot,
    "apps",
    "web",
    "src",
    "app",
    "_platform",
    "runtime"
  )
  if (!fs.existsSync(runtimeRoot)) {
    return
  }

  evaluateWebPlatformI18nDirectory(
    path.join(runtimeRoot, "components"),
    "apps/web/src/app/_platform/runtime/components",
    issues,
    (fileName, relativePath) => {
      if (!/\.(?:ts|tsx)$/u.test(fileName)) {
        return
      }

      if (!KEBAB_CASE_STEM_PATTERN.test(stripExtension(fileName))) {
        issues.push({
          severity: "error",
          rule: "runtime-component-kebab-case",
          path: relativePath,
          message:
            "runtime component filenames must use kebab-case within the bounded Phase 2 naming domain.",
        })
      }
    }
  )

  evaluateWebPlatformI18nDirectory(
    path.join(runtimeRoot, "adapters"),
    "apps/web/src/app/_platform/runtime/adapters",
    issues,
    (fileName, relativePath) => {
      if (!fileName.endsWith(".ts")) {
        return
      }

      if (!fileName.endsWith("-adapter.ts")) {
        issues.push({
          severity: "error",
          rule: "runtime-adapter-suffix",
          path: relativePath,
          message:
            'runtime adapter filenames must end with "-adapter.ts" in the bounded Phase 2 naming domain.',
        })
      }
    }
  )

  evaluateWebPlatformI18nDirectory(
    path.join(runtimeRoot, "hooks"),
    "apps/web/src/app/_platform/runtime/hooks",
    issues,
    (fileName, relativePath) => {
      if (!/\.(?:ts|tsx)$/u.test(fileName)) {
        return
      }

      if (!/^use-[a-z0-9]+(?:-[a-z0-9]+)*\.tsx?$/u.test(fileName)) {
        issues.push({
          severity: "error",
          rule: "runtime-hook-prefix",
          path: relativePath,
          message:
            'runtime hook filenames must use "use-<subject>.ts[x]" naming in the bounded Phase 2 naming domain.',
        })
      }
    }
  )

  evaluateWebPlatformI18nDirectory(
    path.join(runtimeRoot, "policy"),
    "apps/web/src/app/_platform/runtime/policy",
    issues,
    (fileName, relativePath) => {
      if (!fileName.endsWith(".ts")) {
        return
      }

      if (!fileName.endsWith("-policy.ts")) {
        issues.push({
          severity: "error",
          rule: "runtime-policy-suffix",
          path: relativePath,
          message:
            'runtime policy modules must end with "-policy.ts" in the bounded Phase 2 naming domain.',
        })
      }
    }
  )

  evaluateWebPlatformI18nDirectory(
    path.join(runtimeRoot, "scripts"),
    "apps/web/src/app/_platform/runtime/scripts",
    issues,
    (fileName, relativePath) => {
      if (!fileName.endsWith(".ts")) {
        return
      }

      if (!LOCAL_SCRIPT_ENTRYPOINT_PATTERN.test(fileName)) {
        issues.push({
          severity: "error",
          rule: "runtime-script-verb-first",
          path: relativePath,
          message:
            'Local runtime scripts must start with an approved verb and use "<action>-<subject>" naming.',
        })
      }
    }
  )

  evaluateWebPlatformI18nDirectory(
    path.join(runtimeRoot, "services"),
    "apps/web/src/app/_platform/runtime/services",
    issues,
    (fileName, relativePath) => {
      if (!fileName.endsWith(".ts")) {
        return
      }

      if (!fileName.endsWith("-service.ts")) {
        issues.push({
          severity: "error",
          rule: "runtime-service-suffix",
          path: relativePath,
          message:
            'runtime service filenames must end with "-service.ts" in the bounded Phase 2 naming domain.',
        })
      }
    }
  )

  evaluateWebPlatformI18nDirectory(
    path.join(runtimeRoot, "types"),
    "apps/web/src/app/_platform/runtime/types",
    issues,
    (fileName, relativePath) => {
      if (!fileName.endsWith(".ts")) {
        return
      }

      if (
        !fileName.endsWith("-types.ts") &&
        !fileName.endsWith("-types.d.ts")
      ) {
        issues.push({
          severity: "error",
          rule: "runtime-types-suffix",
          path: relativePath,
          message:
            'runtime type modules must end with "-types.ts" or "-types.d.ts" in the bounded Phase 2 naming domain.',
        })
      }
    }
  )

  evaluateWebPlatformI18nDirectory(
    path.join(runtimeRoot, "__tests__"),
    "apps/web/src/app/_platform/runtime/__tests__",
    issues,
    (fileName, relativePath) => {
      if (!/\.(?:ts|tsx)$/u.test(fileName)) {
        return
      }

      if (!TEST_FILE_PATTERN.test(fileName)) {
        issues.push({
          severity: "error",
          rule: "runtime-test-suffix",
          path: relativePath,
          message:
            'runtime unit and integration tests must use "<subject>.test.ts[x]" naming in the bounded Phase 2 naming domain.',
        })
      }
    }
  )
}

function evaluateWebPlatformTenantRoot(
  repoRoot: string,
  issues: NamingConventionIssue[]
) {
  const tenantRoot = path.join(
    repoRoot,
    "apps",
    "web",
    "src",
    "app",
    "_platform",
    "tenant"
  )
  if (!fs.existsSync(tenantRoot)) {
    return
  }

  const files = fs
    .readdirSync(tenantRoot, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)

  for (const fileName of files) {
    const relativePath = `apps/web/src/app/_platform/tenant/${fileName}`

    if (fileName === "index.ts") {
      continue
    }

    evaluateGenericAndRoleOnlyName(fileName, relativePath, issues)

    if (!/\.(?:ts|tsx)$/u.test(fileName)) {
      continue
    }

    const stem = stripExtension(fileName)
    if (!KEBAB_CASE_STEM_PATTERN.test(stem)) {
      issues.push({
        severity: "error",
        rule: "tenant-kebab-case",
        path: relativePath,
        message:
          "tenant platform filenames must use kebab-case within the bounded Phase 2 naming domain.",
      })
    }

    if (fileName.endsWith(".tsx") && !fileName.endsWith("-context.tsx")) {
      issues.push({
        severity: "error",
        rule: "tenant-context-suffix",
        path: relativePath,
        message:
          'tenant React context modules must end with "-context.tsx" in the bounded Phase 2 naming domain.',
      })
    }

    if (fileName.endsWith(".ts") && !fileName.endsWith("-types.ts")) {
      issues.push({
        severity: "error",
        rule: "tenant-types-suffix",
        path: relativePath,
        message:
          'tenant TypeScript modules must end with "-types.ts" in the bounded Phase 2 naming domain.',
      })
    }
  }
}

function evaluateWebPlatformThemeRoot(
  repoRoot: string,
  issues: NamingConventionIssue[]
) {
  const themeRoot = path.join(
    repoRoot,
    "apps",
    "web",
    "src",
    "app",
    "_platform",
    "theme"
  )
  if (!fs.existsSync(themeRoot)) {
    return
  }

  const files = fs
    .readdirSync(themeRoot, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)

  for (const fileName of files) {
    const relativePath = `apps/web/src/app/_platform/theme/${fileName}`

    if (fileName === "index.ts") {
      continue
    }

    evaluateGenericAndRoleOnlyName(fileName, relativePath, issues)

    if (fileName.endsWith(".tsx")) {
      if (
        !/^(?:[a-z0-9]+(?:-[a-z0-9]+)*)-(?:provider|root|meta)\.tsx$/u.test(
          fileName
        )
      ) {
        issues.push({
          severity: "error",
          rule: "theme-tsx-role",
          path: relativePath,
          message:
            'theme React modules must end with "-provider.tsx", "-root.tsx", or "-meta.tsx" in the bounded Phase 2 naming domain.',
        })
      }
      continue
    }

    if (fileName.endsWith(".ts")) {
      if (fileName.startsWith("use-")) {
        continue
      }

      if (!/(?:-preference|-path|-contract)\.ts$/u.test(fileName)) {
        issues.push({
          severity: "error",
          rule: "theme-ts-role",
          path: relativePath,
          message:
            'theme TypeScript modules must be hooks or end with "-preference.ts", "-path.ts", or "-contract.ts" in the bounded Phase 2 naming domain.',
        })
      }
    }
  }

  evaluatePhaseTwoTestDirectory(
    path.join(themeRoot, "__tests__"),
    "apps/web/src/app/_platform/theme/__tests__",
    "theme",
    issues
  )
}

function evaluateWebPlatformConfigRoot(
  repoRoot: string,
  issues: NamingConventionIssue[]
) {
  const configRoot = path.join(
    repoRoot,
    "apps",
    "web",
    "src",
    "app",
    "_platform",
    "config"
  )
  if (!fs.existsSync(configRoot)) {
    return
  }

  const files = fs
    .readdirSync(configRoot, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)

  for (const fileName of files) {
    const relativePath = `apps/web/src/app/_platform/config/${fileName}`

    if (fileName === "index.ts") {
      continue
    }

    evaluateGenericAndRoleOnlyName(fileName, relativePath, issues)

    if (fileName.endsWith(".ts") && !fileName.endsWith("-env.ts")) {
      issues.push({
        severity: "error",
        rule: "config-env-suffix",
        path: relativePath,
        message:
          'config modules must end with "-env.ts" in the bounded Phase 2 naming domain.',
      })
    }
  }
}

function evaluateWebPlatformAppSurfaceRoot(
  repoRoot: string,
  issues: NamingConventionIssue[]
) {
  const root = path.join(
    repoRoot,
    "apps",
    "web",
    "src",
    "app",
    "_platform",
    "app-surface"
  )
  if (!fs.existsSync(root)) {
    return
  }

  evaluateWebPlatformI18nDirectory(
    path.join(root, "components"),
    "apps/web/src/app/_platform/app-surface/components",
    issues,
    (fileName, relativePath) => {
      if (!fileName.endsWith(".tsx")) {
        return
      }

      if (!KEBAB_CASE_STEM_PATTERN.test(stripExtension(fileName))) {
        issues.push({
          severity: "error",
          rule: "app-surface-component-kebab-case",
          path: relativePath,
          message:
            "app-surface component filenames must use kebab-case within the bounded Phase 2 naming domain.",
        })
      }
    }
  )

  evaluateWebPlatformI18nDirectory(
    path.join(root, "contract"),
    "apps/web/src/app/_platform/app-surface/contract",
    issues,
    (fileName, relativePath) => {
      if (fileName.endsWith(".ts") && !fileName.endsWith("-contract.ts")) {
        issues.push({
          severity: "error",
          rule: "app-surface-contract-suffix",
          path: relativePath,
          message:
            'app-surface contract modules must end with "-contract.ts" in the bounded Phase 2 naming domain.',
        })
      }
    }
  )

  evaluateWebPlatformI18nDirectory(
    path.join(root, "services"),
    "apps/web/src/app/_platform/app-surface/services",
    issues,
    (fileName, relativePath) => {
      if (!fileName.endsWith(".ts")) {
        return
      }

      if (!LOCAL_SCRIPT_ENTRYPOINT_PATTERN.test(fileName)) {
        issues.push({
          severity: "error",
          rule: "app-surface-service-verb",
          path: relativePath,
          message:
            "app-surface service modules must use approved verb-first naming in the bounded Phase 2 naming domain.",
        })
      }
    }
  )

  evaluatePhaseTwoTestDirectory(
    path.join(root, "__tests__"),
    "apps/web/src/app/_platform/app-surface/__tests__",
    "app-surface",
    issues
  )
}

function evaluateWebPlatformAuthRoot(
  repoRoot: string,
  issues: NamingConventionIssue[]
) {
  const root = path.join(
    repoRoot,
    "apps",
    "web",
    "src",
    "app",
    "_platform",
    "auth"
  )
  if (!fs.existsSync(root)) {
    return
  }

  const rootFiles = fs
    .readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)

  for (const fileName of rootFiles) {
    const relativePath = `apps/web/src/app/_platform/auth/${fileName}`

    if (fileName === "index.ts" || fileName === "auth.css") {
      continue
    }

    evaluateGenericAndRoleOnlyName(fileName, relativePath, issues)

    if (
      fileName.endsWith(".ts") &&
      !/^(?:auth|setup)-[a-z0-9]+(?:-[a-z0-9]+)*\.ts$/u.test(fileName)
    ) {
      issues.push({
        severity: "error",
        rule: "auth-root-kebab-case",
        path: relativePath,
        message:
          "auth root TypeScript modules must use explicit kebab-case auth/setup naming in the bounded Phase 2 naming domain.",
      })
    }
  }

  evaluateWebPlatformI18nDirectory(
    path.join(root, "better-auth-ui"),
    "apps/web/src/app/_platform/auth/better-auth-ui",
    issues,
    (fileName, relativePath) => {
      if (fileName.endsWith(".tsx")) {
        if (!/(?:-link|-provider)\.tsx$/u.test(fileName)) {
          issues.push({
            severity: "error",
            rule: "auth-better-auth-ui-tsx-role",
            path: relativePath,
            message:
              'better-auth-ui React modules must end with "-link.tsx" or "-provider.tsx" in the bounded Phase 2 naming domain.',
          })
        }
        return
      }

      if (
        fileName.endsWith(".ts") &&
        !/^use-[a-z0-9]+(?:-[a-z0-9]+)*\.ts$/u.test(fileName)
      ) {
        issues.push({
          severity: "error",
          rule: "auth-better-auth-ui-hook",
          path: relativePath,
          message:
            'better-auth-ui TypeScript modules must use "use-<subject>.ts" naming in the bounded Phase 2 naming domain.',
        })
      }
    }
  )

  evaluateKebabCaseDirectory(
    path.join(root, "contracts"),
    "apps/web/src/app/_platform/auth/contracts",
    issues,
    "auth contract modules"
  )

  evaluateWebPlatformI18nDirectory(
    path.join(root, "guards"),
    "apps/web/src/app/_platform/auth/guards",
    issues,
    (fileName, relativePath) => {
      if (
        fileName.endsWith(".tsx") &&
        !/^require-[a-z0-9]+(?:-[a-z0-9]+)*\.tsx$/u.test(fileName)
      ) {
        issues.push({
          severity: "error",
          rule: "auth-guard-prefix",
          path: relativePath,
          message:
            'auth guard modules must use "require-<subject>.tsx" naming in the bounded Phase 2 naming domain.',
        })
      }
    }
  )

  evaluateHookDirectory(
    path.join(root, "hooks"),
    "apps/web/src/app/_platform/auth/hooks",
    "auth",
    issues
  )

  evaluateWebPlatformI18nDirectory(
    path.join(root, "mappers"),
    "apps/web/src/app/_platform/auth/mappers",
    issues,
    (fileName, relativePath) => {
      if (
        fileName.endsWith(".ts") &&
        !/^map-[a-z0-9]+(?:-[a-z0-9]+)*\.ts$/u.test(fileName)
      ) {
        issues.push({
          severity: "error",
          rule: "auth-mapper-prefix",
          path: relativePath,
          message:
            'auth mapper modules must use "map-<subject>.ts" naming in the bounded Phase 2 naming domain.',
        })
      }
    }
  )

  evaluatePhaseTwoTestDirectory(
    path.join(root, "mappers", "__tests__"),
    "apps/web/src/app/_platform/auth/mappers/__tests__",
    "auth mapper",
    issues
  )

  evaluateWebPlatformI18nDirectory(
    path.join(root, "routes"),
    "apps/web/src/app/_platform/auth/routes",
    issues,
    (fileName, relativePath) => {
      if (!fileName.endsWith(".tsx")) {
        return
      }

      if (
        !/^route-[a-z0-9]+(?:-[a-z0-9]+)*\.tsx$/u.test(fileName) &&
        fileName !== "auth-layout.tsx"
      ) {
        issues.push({
          severity: "error",
          rule: "auth-route-name",
          path: relativePath,
          message:
            'auth route modules must use "route-<subject>.tsx" naming or the documented "auth-layout.tsx" layout name in the bounded Phase 2 naming domain.',
        })
      }
    }
  )

  evaluatePhaseTwoTestDirectory(
    path.join(root, "routes", "__tests__"),
    "apps/web/src/app/_platform/auth/routes/__tests__",
    "auth route",
    issues
  )

  evaluateWebPlatformI18nDirectory(
    path.join(root, "services"),
    "apps/web/src/app/_platform/auth/services",
    issues,
    (fileName, relativePath) => {
      if (fileName.endsWith(".ts") && !fileName.endsWith("-service.ts")) {
        issues.push({
          severity: "error",
          rule: "auth-service-suffix",
          path: relativePath,
          message:
            'auth service modules must end with "-service.ts" in the bounded Phase 2 naming domain.',
        })
      }
    }
  )

  evaluatePhaseTwoTestDirectory(
    path.join(root, "__tests__"),
    "apps/web/src/app/_platform/auth/__tests__",
    "auth",
    issues
  )
}

function evaluateWebPlatformShellRoot(
  repoRoot: string,
  issues: NamingConventionIssue[]
) {
  const root = path.join(
    repoRoot,
    "apps",
    "web",
    "src",
    "app",
    "_platform",
    "shell"
  )
  if (!fs.existsSync(root)) {
    return
  }

  const rootFiles = fs
    .readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)

  for (const fileName of rootFiles) {
    const relativePath = `apps/web/src/app/_platform/shell/${fileName}`

    if (fileName === "index.ts" || fileName === "README.md") {
      continue
    }

    evaluateGenericAndRoleOnlyName(fileName, relativePath, issues)

    if (
      fileName.endsWith(".ts") &&
      !KEBAB_CASE_STEM_PATTERN.test(stripExtension(fileName))
    ) {
      issues.push({
        severity: "error",
        rule: "shell-root-kebab-case",
        path: relativePath,
        message:
          "shell root TypeScript modules must use kebab-case within the bounded Phase 2 naming domain.",
      })
    }
  }

  evaluateShellComponentsDirectory(
    path.join(root, "components"),
    "apps/web/src/app/_platform/shell/components",
    issues
  )
  evaluateShellComponentsDirectory(
    path.join(root, "components", "shell-content-block"),
    "apps/web/src/app/_platform/shell/components/shell-content-block",
    issues
  )
  evaluateShellComponentsDirectory(
    path.join(root, "components", "shell-left-sidebar-block"),
    "apps/web/src/app/_platform/shell/components/shell-left-sidebar-block",
    issues
  )
  evaluateShellComponentsDirectory(
    path.join(root, "components", "shell-rail-sidebar-block"),
    "apps/web/src/app/_platform/shell/components/shell-rail-sidebar-block",
    issues
  )
  evaluateShellComponentsDirectory(
    path.join(root, "components", "shell-top-nav-block"),
    "apps/web/src/app/_platform/shell/components/shell-top-nav-block",
    issues
  )

  evaluatePhaseTwoTestDirectory(
    path.join(root, "components", "__tests__"),
    "apps/web/src/app/_platform/shell/components/__tests__",
    "shell component",
    issues
  )
  evaluatePhaseTwoTestDirectory(
    path.join(root, "components", "shell-content-block", "__tests__"),
    "apps/web/src/app/_platform/shell/components/shell-content-block/__tests__",
    "shell content block",
    issues
  )
  evaluatePhaseTwoTestDirectory(
    path.join(root, "components", "shell-left-sidebar-block", "__tests__"),
    "apps/web/src/app/_platform/shell/components/shell-left-sidebar-block/__tests__",
    "shell left sidebar block",
    issues
  )

  evaluateKebabCaseDirectory(
    path.join(root, "constants"),
    "apps/web/src/app/_platform/shell/constants",
    issues,
    "shell constant modules"
  )

  evaluateWebPlatformI18nDirectory(
    path.join(root, "contract"),
    "apps/web/src/app/_platform/shell/contract",
    issues,
    (fileName, relativePath) => {
      if (!fileName.endsWith(".ts")) {
        return
      }

      if (
        !fileName.endsWith("-contract.ts") &&
        !fileName.endsWith(".contract.ts") &&
        !fileName.endsWith("-codes.ts")
      ) {
        issues.push({
          severity: "error",
          rule: "shell-contract-name",
          path: relativePath,
          message:
            'shell contract modules must end with "-contract.ts", ".contract.ts", or "-codes.ts" in the bounded Phase 2 naming domain.',
        })
      }
    }
  )

  evaluateWebPlatformI18nDirectory(
    path.join(root, "errors"),
    "apps/web/src/app/_platform/shell/errors",
    issues,
    (fileName, relativePath) => {
      if (fileName.endsWith(".ts") && !fileName.endsWith("-error.ts")) {
        issues.push({
          severity: "error",
          rule: "shell-error-suffix",
          path: relativePath,
          message:
            'shell error modules must end with "-error.ts" in the bounded Phase 2 naming domain.',
        })
      }
    }
  )

  evaluateHookDirectory(
    path.join(root, "hooks"),
    "apps/web/src/app/_platform/shell/hooks",
    "shell",
    issues
  )

  evaluateWebPlatformI18nDirectory(
    path.join(root, "policy"),
    "apps/web/src/app/_platform/shell/policy",
    issues,
    (fileName, relativePath) => {
      if (fileName.endsWith(".ts") && !fileName.endsWith("-policy.ts")) {
        issues.push({
          severity: "error",
          rule: "shell-policy-suffix",
          path: relativePath,
          message:
            'shell policy modules must end with "-policy.ts" in the bounded Phase 2 naming domain.',
        })
      }
    }
  )

  evaluateWebPlatformI18nDirectory(
    path.join(root, "registry"),
    "apps/web/src/app/_platform/shell/registry",
    issues,
    (fileName, relativePath) => {
      if (
        fileName.endsWith(".ts") &&
        !fileName.endsWith("-registry.ts") &&
        !fileName.endsWith("-instance.ts")
      ) {
        issues.push({
          severity: "error",
          rule: "shell-registry-name",
          path: relativePath,
          message:
            'shell registry modules must end with "-registry.ts" or "-instance.ts" in the bounded Phase 2 naming domain.',
        })
      }
    }
  )

  evaluateKebabCaseDirectory(
    path.join(root, "routes"),
    "apps/web/src/app/_platform/shell/routes",
    issues,
    "shell route modules"
  )

  evaluateWebPlatformI18nDirectory(
    path.join(root, "scripts"),
    "apps/web/src/app/_platform/shell/scripts",
    issues,
    (fileName, relativePath) => {
      if (!fileName.endsWith(".ts")) {
        return
      }

      if (!LOCAL_SCRIPT_ENTRYPOINT_PATTERN.test(fileName)) {
        issues.push({
          severity: "error",
          rule: "shell-script-verb-first",
          path: relativePath,
          message:
            'Local shell scripts must start with an approved verb and use "<action>-<subject>" naming.',
        })
      }
    }
  )

  evaluateKebabCaseDirectory(
    path.join(root, "services"),
    "apps/web/src/app/_platform/shell/services",
    issues,
    "shell service modules"
  )

  evaluateWebPlatformI18nDirectory(
    path.join(root, "store"),
    "apps/web/src/app/_platform/shell/store",
    issues,
    (fileName, relativePath) => {
      if (
        fileName.endsWith(".ts") &&
        !fileName.endsWith("-store.ts") &&
        !fileName.endsWith("-instance.ts")
      ) {
        issues.push({
          severity: "error",
          rule: "shell-store-name",
          path: relativePath,
          message:
            'shell store modules must end with "-store.ts" or "-instance.ts" in the bounded Phase 2 naming domain.',
        })
      }
    }
  )

  evaluateKebabCaseDirectory(
    path.join(root, "types"),
    "apps/web/src/app/_platform/shell/types",
    issues,
    "shell type modules"
  )

  evaluatePhaseTwoTestDirectory(
    path.join(root, "__tests__"),
    "apps/web/src/app/_platform/shell/__tests__",
    "shell",
    issues
  )
}

function evaluatePhaseTwoTestDirectory(
  absoluteRoot: string,
  relativeRoot: string,
  domainLabel: string,
  issues: NamingConventionIssue[]
) {
  evaluateWebPlatformI18nDirectory(
    absoluteRoot,
    relativeRoot,
    issues,
    (fileName, relativePath) => {
      if (!/\.(?:ts|tsx)$/u.test(fileName)) {
        return
      }

      if (!TEST_FILE_PATTERN.test(fileName)) {
        issues.push({
          severity: "error",
          rule: `${domainLabel}-test-suffix`,
          path: relativePath,
          message: `${domainLabel} unit and integration tests must use "<subject>.test.ts[x]" naming in the bounded Phase 2 naming domain.`,
        })
      }
    }
  )
}

function evaluateHookDirectory(
  absoluteRoot: string,
  relativeRoot: string,
  domainLabel: string,
  issues: NamingConventionIssue[]
) {
  evaluateWebPlatformI18nDirectory(
    absoluteRoot,
    relativeRoot,
    issues,
    (fileName, relativePath) => {
      if (!/\.(?:ts|tsx)$/u.test(fileName)) {
        return
      }

      if (!/^use-[a-z0-9]+(?:-[a-z0-9]+)*\.tsx?$/u.test(fileName)) {
        issues.push({
          severity: "error",
          rule: `${domainLabel}-hook-prefix`,
          path: relativePath,
          message: `${domainLabel} hook modules must use "use-<subject>.ts[x]" naming in the bounded Phase 2 naming domain.`,
        })
      }
    }
  )
}

function evaluateKebabCaseDirectory(
  absoluteRoot: string,
  relativeRoot: string,
  issues: NamingConventionIssue[],
  label: string
) {
  evaluateWebPlatformI18nDirectory(
    absoluteRoot,
    relativeRoot,
    issues,
    (fileName, relativePath) => {
      if (fileName === "index.ts") {
        return
      }

      if (!/\.(?:ts|tsx)$/u.test(fileName)) {
        return
      }

      if (!KEBAB_CASE_STEM_PATTERN.test(stripExtension(fileName))) {
        issues.push({
          severity: "error",
          rule: "kebab-case-directory",
          path: relativePath,
          message: `${label} must use kebab-case filenames within the bounded Phase 2 naming domain.`,
        })
      }
    }
  )
}

function evaluateShellComponentsDirectory(
  absoluteRoot: string,
  relativeRoot: string,
  issues: NamingConventionIssue[]
) {
  evaluateWebPlatformI18nDirectory(
    absoluteRoot,
    relativeRoot,
    issues,
    (fileName, relativePath) => {
      if (fileName === "index.ts") {
        return
      }

      if (!/\.(?:ts|tsx)$/u.test(fileName)) {
        return
      }

      if (fileName.endsWith(".config.ts")) {
        return
      }

      const stem = stripExtension(fileName)
      if (!KEBAB_CASE_STEM_PATTERN.test(stem)) {
        issues.push({
          severity: "error",
          rule: "shell-component-kebab-case",
          path: relativePath,
          message:
            "shell component module filenames must use kebab-case within the bounded Phase 2 naming domain.",
        })
        return
      }

      if (fileName.startsWith("use-")) {
        return
      }
    }
  )
}

function evaluateAppComponentsRoot(
  repoRoot: string,
  issues: NamingConventionIssue[]
) {
  const root = path.join(repoRoot, "apps", "web", "src", "app", "_components")
  if (!fs.existsSync(root)) {
    return
  }

  evaluateRecursiveNamingSurface(root, "apps/web/src/app/_components", issues, {
    allowIndexAtRoots: new Set([
      "apps/web/src/app/_components",
      "apps/web/src/app/_components/app-states",
    ]),
    onFile(fileName, relativePath, directoryName) {
      if (fileName === "index.ts") {
        return null
      }

      if (directoryName === "__tests__") {
        return validateTestFile("app component", fileName, relativePath)
      }

      if (!/\.(?:ts|tsx)$/u.test(fileName)) {
        return null
      }

      return validateLowerRoleFile("app component", fileName, relativePath)
    },
  })
}

function evaluateAppFeaturesRoot(
  repoRoot: string,
  issues: NamingConventionIssue[]
) {
  const featuresRoot = path.join(
    repoRoot,
    "apps",
    "web",
    "src",
    "app",
    "_features"
  )
  if (!fs.existsSync(featuresRoot)) {
    return
  }

  const featureRoots = fs
    .readdirSync(featuresRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)

  for (const featureName of featureRoots) {
    const absoluteRoot = path.join(featuresRoot, featureName)
    const relativeRoot = `apps/web/src/app/_features/${featureName}`

    evaluateRecursiveNamingSurface(absoluteRoot, relativeRoot, issues, {
      allowIndexAtRoots: new Set([
        relativeRoot,
        `${relativeRoot}/actions`,
        `${relativeRoot}/hooks`,
      ]),
      ignoredDirectoryNames: new Set(["db-schema"]),
      onFile(fileName, relativePath, directoryName) {
        if (fileName === "README.md" || fileName === "index.ts") {
          return null
        }

        if (
          directoryName === "__tests__" ||
          fileName.endsWith(".test.ts") ||
          fileName.endsWith(".test.tsx")
        ) {
          return validateTestFile("feature", fileName, relativePath)
        }

        if (!/\.(?:ts|tsx)$/u.test(fileName)) {
          return null
        }

        if (directoryName === "components") {
          return validateKebabCaseFile(
            "feature component",
            fileName,
            relativePath
          )
        }

        if (directoryName === "hooks") {
          return validateHookFile("feature", fileName, relativePath)
        }

        if (directoryName === "scripts") {
          return validateLocalScriptFile("feature", fileName, relativePath)
        }

        if (
          directoryName === "actions" ||
          directoryName === "services" ||
          directoryName === "types" ||
          directoryName === featureName ||
          directoryName === "_features" ||
          directoryName === "users"
        ) {
          return validateLowerRoleFile("feature", fileName, relativePath)
        }

        return validateLowerRoleFile("feature", fileName, relativePath)
      },
    })
  }
}

function evaluateWebRoutesRoot(
  repoRoot: string,
  issues: NamingConventionIssue[]
) {
  const root = path.join(repoRoot, "apps", "web", "src", "routes")
  if (!fs.existsSync(root)) {
    return
  }

  const files = fs
    .readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)

  for (const fileName of files) {
    const relativePath = `apps/web/src/routes/${fileName}`

    if (fileName === "index.ts" || fileName === "README.md") {
      continue
    }

    evaluateGenericAndRoleOnlyName(fileName, relativePath, issues)

    if (
      fileName.endsWith(".tsx") &&
      !/^route-[a-z0-9]+(?:-[a-z0-9]+)*\.tsx$/u.test(fileName)
    ) {
      issues.push({
        severity: "error",
        rule: "route-module-prefix",
        path: relativePath,
        message:
          'route modules must use "route-<subject>.tsx" naming in the routes root.',
      })
    }

    if (fileName.endsWith(".ts") && fileName !== "index.ts") {
      const stem = stripExtension(fileName)
      if (!KEBAB_CASE_STEM_PATTERN.test(stem)) {
        issues.push({
          severity: "error",
          rule: "route-helper-kebab-case",
          path: relativePath,
          message:
            "route helper filenames must use kebab-case in the routes root.",
        })
      }
    }
  }

  evaluateWebPlatformI18nDirectory(
    path.join(root, "__tests__"),
    "apps/web/src/routes/__tests__",
    issues,
    (fileName, relativePath) => {
      if (!/\.(?:ts|tsx)$/u.test(fileName)) {
        return
      }

      const issue = validateTestFile("route", fileName, relativePath)
      if (issue) {
        issues.push(issue)
      }
    }
  )
}

function evaluateWebShareRoot(
  repoRoot: string,
  issues: NamingConventionIssue[]
) {
  const root = path.join(repoRoot, "apps", "web", "src", "share")
  if (!fs.existsSync(root)) {
    return
  }

  evaluateRecursiveNamingSurface(root, "apps/web/src/share", issues, {
    onFile(fileName, relativePath, directoryName) {
      if (directoryName === "__tests__") {
        return validateTestFile("shared component", fileName, relativePath)
      }

      if (!/\.(?:ts|tsx)$/u.test(fileName)) {
        return null
      }

      return validateKebabCaseFile("shared component", fileName, relativePath)
    },
  })
}

function evaluateWebRpcRoot(repoRoot: string, issues: NamingConventionIssue[]) {
  const root = path.join(repoRoot, "apps", "web", "src", "rpc")
  if (!fs.existsSync(root)) {
    return
  }

  const files = fs
    .readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)

  for (const fileName of files) {
    const relativePath = `apps/web/src/rpc/${fileName}`

    if (fileName === "index.ts") {
      continue
    }

    evaluateGenericAndRoleOnlyName(fileName, relativePath, issues)

    if (!/^web-[a-z0-9]+(?:-[a-z0-9]+)*\.ts$/u.test(fileName)) {
      issues.push({
        severity: "error",
        rule: "rpc-web-prefix",
        path: relativePath,
        message:
          'rpc modules must use "web-<subject>.ts" naming in the rpc root.',
      })
    }
  }

  evaluatePhaseTwoTestDirectory(
    path.join(root, "__tests__"),
    "apps/web/src/rpc/__tests__",
    "rpc",
    issues
  )
}

function evaluateWebMarketingRoot(
  repoRoot: string,
  issues: NamingConventionIssue[]
) {
  const root = path.join(repoRoot, "apps", "web", "src", "marketing")
  if (!fs.existsSync(root)) {
    return
  }

  evaluateRecursiveNamingSurface(root, "apps/web/src/marketing", issues, {
    allowIndexAtRoots: new Set(["apps/web/src/marketing/components"]),
    onFile(fileName, relativePath, directoryName) {
      if (fileName === "README.md" || fileName === "marketing.css") {
        return null
      }

      if (directoryName === "__tests__") {
        return validatePackageTestFile("marketing", fileName, relativePath)
      }

      if (fileName === "marketing.config.ts") {
        return null
      }

      if (!/\.(?:ts|tsx|md)$/u.test(fileName)) {
        return null
      }

      if (relativePath.startsWith("apps/web/src/marketing/components/")) {
        if (fileName === "index.ts") {
          return null
        }

        if (
          !/^marketing-[a-z0-9]+(?:-[a-z0-9]+)*\.(?:ts|tsx)$/u.test(fileName)
        ) {
          return {
            severity: "error",
            rule: "marketing-component-name",
            path: relativePath,
            message:
              'marketing shared components must use "marketing-<subject>.ts[x]" naming.',
          }
        }

        return null
      }

      if (
        relativePath.startsWith("apps/web/src/marketing/pages/landing/") &&
        !relativePath.startsWith(
          "apps/web/src/marketing/pages/landing/flagship/"
        )
      ) {
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*-landing-page\.tsx$/u.test(fileName)) {
          return {
            severity: "error",
            rule: "marketing-landing-name",
            path: relativePath,
            message:
              'marketing landing variants must use descriptive "<subject>-landing-page.tsx" naming.',
          }
        }

        return null
      }

      if (
        relativePath.startsWith(
          "apps/web/src/marketing/pages/landing/flagship/"
        )
      ) {
        if (
          !/^flagship-page(?:-[a-z0-9]+(?:-[a-z0-9]+)*)?\.(?:ts|tsx)$/u.test(
            fileName
          )
        ) {
          return {
            severity: "error",
            rule: "flagship-page-name",
            path: relativePath,
            message:
              'flagship landing modules must use "flagship-page[-<subject>].ts[x]" naming.',
          }
        }

        return null
      }

      if (
        relativePath.startsWith("apps/web/src/marketing/pages/company/about/")
      ) {
        if (
          fileName === "about-page-editorial.ts" ||
          /^about-page(?:-[a-z0-9]+(?:-[a-z0-9]+)*)?\.tsx$/u.test(fileName) ||
          /^about-page-section-[a-z0-9]+(?:-[a-z0-9]+)*\.tsx$/u.test(fileName)
        ) {
          return null
        }

        return {
          severity: "error",
          rule: "about-page-name",
          path: relativePath,
          message:
            "about page modules must use explicit about-page or section-prefixed naming.",
        }
      }

      if (relativePath.includes("/pages/")) {
        if (
          /^[a-z0-9]+(?:-[a-z0-9]+)*-page(?:-[a-z0-9]+(?:-[a-z0-9]+)*)?\.(?:ts|tsx)$/u.test(
            fileName
          ) ||
          /^[a-z0-9]+(?:-[a-z0-9]+)*-page-editorial\.ts$/u.test(fileName)
        ) {
          return null
        }

        return {
          severity: "error",
          rule: "marketing-page-name",
          path: relativePath,
          message:
            "marketing page modules must use descriptive *-page, *-page-editorial, or section-* naming.",
        }
      }

      if (relativePath.startsWith("apps/web/src/marketing/")) {
        if (
          /^marketing(?:-[a-z0-9]+(?:-[a-z0-9]+)*)?(?:\.config)?\.(?:ts|tsx)$/u.test(
            fileName
          )
        ) {
          return null
        }

        return {
          severity: "error",
          rule: "marketing-root-name",
          path: relativePath,
          message:
            'marketing root modules must use "marketing-<subject>.ts[x]" naming.',
        }
      }

      return null
    },
  })
}

function evaluateContractsPackageRoot(
  repoRoot: string,
  issues: NamingConventionIssue[]
) {
  evaluatePublicIndexOnlyPackageRoot(
    path.join(repoRoot, "packages", "contracts", "src"),
    "packages/contracts/src",
    issues,
    "contracts"
  )
}

function evaluateEnvLoaderPackageRoot(
  repoRoot: string,
  issues: NamingConventionIssue[]
) {
  evaluatePublicIndexOnlyPackageRoot(
    path.join(repoRoot, "packages", "env-loader", "src"),
    "packages/env-loader/src",
    issues,
    "env-loader"
  )
}

function evaluatePinoLoggerPackageRoot(
  repoRoot: string,
  issues: NamingConventionIssue[]
) {
  const root = path.join(repoRoot, "packages", "pino-logger", "src")
  if (!fs.existsSync(root)) {
    return
  }

  evaluateRecursiveNamingSurface(root, "packages/pino-logger/src", issues, {
    allowIndexAtRoots: new Set(["packages/pino-logger/src"]),
    onFile(fileName, relativePath, directoryName) {
      if (directoryName === "__tests__") {
        return validatePackageTestFile("pino logger", fileName, relativePath)
      }

      if (!fileName.endsWith(".ts")) {
        return null
      }

      return validateLowerRoleFile("pino logger", fileName, relativePath)
    },
  })
}

function evaluateBetterAuthPackageRoot(
  repoRoot: string,
  issues: NamingConventionIssue[]
) {
  const srcRoot = path.join(repoRoot, "packages", "better-auth", "src")
  if (fs.existsSync(srcRoot)) {
    evaluateRecursiveNamingSurface(
      srcRoot,
      "packages/better-auth/src",
      issues,
      {
        allowIndexAtRoots: new Set([
          "packages/better-auth/src",
          "packages/better-auth/src/schema",
        ]),
        onFile(fileName, relativePath, directoryName) {
          if (fileName === "README.md") {
            return null
          }

          if (directoryName === "__tests__" || fileName.endsWith(".test.ts")) {
            return validatePackageTestFile(
              "better auth",
              fileName,
              relativePath
            )
          }

          if (fileName.endsWith(".generated.ts")) {
            if (!/^[a-z0-9]+(?:-[a-z0-9]+)*\.generated\.ts$/u.test(fileName)) {
              return {
                severity: "error",
                rule: "better-auth-generated-name",
                path: relativePath,
                message:
                  'better-auth generated modules must use "<subject>.generated.ts" naming.',
              }
            }

            return null
          }

          if (!fileName.endsWith(".ts")) {
            return null
          }

          return validateLowerRoleFile("better auth", fileName, relativePath)
        },
      }
    )
  }

  evaluatePackageScriptDirectory(
    path.join(repoRoot, "packages", "better-auth", "scripts"),
    "packages/better-auth/scripts",
    "better-auth",
    issues
  )
}

function evaluateVitestConfigPackageRoot(
  repoRoot: string,
  issues: NamingConventionIssue[]
) {
  const srcRoot = path.join(repoRoot, "packages", "vitest-config", "src")
  if (fs.existsSync(srcRoot)) {
    evaluateRecursiveNamingSurface(
      srcRoot,
      "packages/vitest-config/src",
      issues,
      {
        onFile(fileName, relativePath, directoryName) {
          if (directoryName === "__tests__") {
            return validatePackageTestFile(
              "vitest config",
              fileName,
              relativePath
            )
          }

          if (!fileName.endsWith(".ts")) {
            return null
          }

          return validateLowerRoleFile("vitest config", fileName, relativePath)
        },
      }
    )
  }

  evaluateWebPlatformI18nDirectory(
    path.join(repoRoot, "packages", "vitest-config", "dist", "vitest"),
    "packages/vitest-config/dist/vitest",
    issues,
    (fileName, relativePath) => {
      if (
        !/^[a-z0-9]+(?:-[a-z0-9]+)*(?:\.(?:js|d\.ts|d\.ts\.map))$/u.test(
          fileName
        )
      ) {
        issues.push({
          severity: "error",
          rule: "vitest-config-dist-name",
          path: relativePath,
          message:
            "vitest-config dist artifacts must use kebab-case stems with .js, .d.ts, or .d.ts.map extensions.",
        })
      }
    }
  )
}

function evaluateEslintConfigPackageRoot(
  repoRoot: string,
  issues: NamingConventionIssue[]
) {
  const root = path.join(repoRoot, "packages", "eslint-config", "src")
  if (!fs.existsSync(root)) {
    return
  }

  evaluateRecursiveNamingSurface(root, "packages/eslint-config/src", issues, {
    allowIndexAtRoots: new Set([
      "packages/eslint-config/src",
      "packages/eslint-config/src/rules",
    ]),
    onFile(fileName, relativePath, directoryName) {
      if (fileName === "README.md") {
        return null
      }

      if (directoryName === "__tests__") {
        return validateJsPackageTestFile("eslint rule", fileName, relativePath)
      }

      if (!fileName.endsWith(".js")) {
        return null
      }

      if (
        relativePath === "packages/eslint-config/src/index.js" ||
        relativePath === "packages/eslint-config/src/plugin.js"
      ) {
        return null
      }

      return validateKebabCaseJsFile("eslint rule", fileName, relativePath)
    },
  })
}

function evaluateDesignSystemPackageRoot(
  repoRoot: string,
  issues: NamingConventionIssue[]
) {
  evaluateDesignSystemHooksRoot(repoRoot, issues)
  evaluateDesignSystemIconsRoot(repoRoot, issues)
  evaluateDesignSystemUiPrimitivesRoot(repoRoot, issues)
  evaluateDesignSystemUtilsRoot(repoRoot, issues)
  evaluateDesignSystemGeneratedRoot(repoRoot, issues)
  evaluateDesignSystemScriptsRoot(repoRoot, issues)
  evaluateDesignSystemArchitectureRoot(repoRoot, issues)
}

function evaluateDatabasePackageRoot(
  repoRoot: string,
  issues: NamingConventionIssue[]
) {
  evaluatePackageScriptDirectory(
    path.join(repoRoot, "packages", "_database", "scripts"),
    "packages/_database/scripts",
    "database",
    issues
  )

  evaluateDatabaseSqlRoot(repoRoot, issues)
  evaluateDatabaseDrizzleRoot(repoRoot, issues)
  evaluateDatabaseSourceRoot(repoRoot, issues)
}

function evaluatePublicIndexOnlyPackageRoot(
  absoluteRoot: string,
  relativeRoot: string,
  issues: NamingConventionIssue[],
  domainLabel: string
) {
  if (!fs.existsSync(absoluteRoot)) {
    return
  }

  const files = fs
    .readdirSync(absoluteRoot, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)

  for (const fileName of files) {
    const relativePath = `${relativeRoot}/${fileName}`
    if (fileName === "index.ts") {
      continue
    }

    evaluateGenericAndRoleOnlyName(fileName, relativePath, issues)
    issues.push({
      severity: "error",
      rule: `${domainLabel}-public-index-only`,
      path: relativePath,
      message: `${domainLabel} package source currently allows only an explicit public index.ts entrypoint.`,
    })
  }
}

function evaluatePackageScriptDirectory(
  absoluteRoot: string,
  relativeRoot: string,
  domainLabel: string,
  issues: NamingConventionIssue[]
) {
  evaluateWebPlatformI18nDirectory(
    absoluteRoot,
    relativeRoot,
    issues,
    (fileName, relativePath) => {
      if (!/\.(?:ts|mjs)$/u.test(fileName)) {
        return
      }

      if (!PACKAGE_LOCAL_SCRIPT_ENTRYPOINT_PATTERN.test(fileName)) {
        issues.push({
          severity: "error",
          rule: `${domainLabel}-package-script-name`,
          path: relativePath,
          message: `Package-local ${domainLabel} scripts must use an approved verb-first naming pattern.`,
        })
      }
    }
  )
}

function validatePackageTestFile(
  domainLabel: string,
  fileName: string,
  relativePath: string
): NamingConventionIssue | null {
  if (
    PACKAGE_TEST_FILE_PATTERN.test(fileName) ||
    /(?:^|-)(?:inventory|test-utils|testing-utils)\.ts$/u.test(fileName)
  ) {
    return null
  }

  return {
    severity: "error",
    rule: `${domainLabel}-package-test-suffix`,
    path: relativePath,
    message: `${domainLabel} package tests must use "<subject>[.<role>].test.ts[x]" naming, with explicit *-inventory.ts files allowed.`,
  }
}

function validateJsPackageTestFile(
  domainLabel: string,
  fileName: string,
  relativePath: string
): NamingConventionIssue | null {
  if (
    /^[a-z0-9]+(?:-[a-z0-9]+)*(?:\.[a-z0-9]+(?:-[a-z0-9]+)*)*\.test\.js$/u.test(
      fileName
    )
  ) {
    return null
  }

  return {
    severity: "error",
    rule: `${domainLabel}-package-test-suffix`,
    path: relativePath,
    message: `${domainLabel} tests must use "<subject>[.<role>].test.js" naming.`,
  }
}

function validateKebabCaseJsFile(
  domainLabel: string,
  fileName: string,
  relativePath: string
): NamingConventionIssue | null {
  if (!KEBAB_CASE_STEM_PATTERN.test(stripExtension(fileName))) {
    return {
      severity: "error",
      rule: `${domainLabel}-kebab-case`,
      path: relativePath,
      message: `${domainLabel} filenames must use kebab-case.`,
    }
  }

  return null
}

function evaluateDesignSystemHooksRoot(
  repoRoot: string,
  issues: NamingConventionIssue[]
) {
  const root = path.join(repoRoot, "packages", "design-system", "hooks")
  if (!fs.existsSync(root)) {
    return
  }

  evaluateRecursiveNamingSurface(root, "packages/design-system/hooks", issues, {
    allowIndexAtRoots: new Set(["packages/design-system/hooks"]),
    onFile(fileName, relativePath) {
      if (!fileName.endsWith(".ts")) {
        return null
      }

      if (fileName === "index.ts") {
        return null
      }

      return validateHookFile("design-system hook", fileName, relativePath)
    },
  })
}

function evaluateDesignSystemIconsRoot(
  repoRoot: string,
  issues: NamingConventionIssue[]
) {
  const root = path.join(repoRoot, "packages", "design-system", "icons")
  if (!fs.existsSync(root)) {
    return
  }

  evaluateRecursiveNamingSurface(root, "packages/design-system/icons", issues, {
    allowIndexAtRoots: new Set(["packages/design-system/icons"]),
    onFile(fileName, relativePath, directoryName) {
      if (fileName === "README.md" || fileName === "index.ts") {
        return null
      }

      if (directoryName === "__tests__") {
        return validatePackageTestFile(
          "design-system icon",
          fileName,
          relativePath
        )
      }

      if (relativePath.startsWith("packages/design-system/icons/script/")) {
        return PACKAGE_LOCAL_SCRIPT_ENTRYPOINT_PATTERN.test(fileName)
          ? null
          : {
              severity: "error",
              rule: "design-system-icon-script-name",
              path: relativePath,
              message:
                "design-system icon scripts must use an approved verb-first naming pattern.",
            }
      }

      if (/^__[^/]+__\.ts$/u.test(fileName)) {
        return null
      }

      if (
        fileName === "libraries.ts" ||
        fileName === "icon-policy.ts" ||
        fileName === "create-icon-loader.tsx"
      ) {
        return null
      }

      if (/^icon-[a-z0-9]+(?:-[a-z0-9]+)*\.tsx$/u.test(fileName)) {
        return null
      }

      return {
        severity: "error",
        rule: "design-system-icon-name",
        path: relativePath,
        message:
          "design-system icon files must use icon-*, explicit helper names, or generated __name__ families.",
      }
    },
  })
}

function evaluateDesignSystemUiPrimitivesRoot(
  repoRoot: string,
  issues: NamingConventionIssue[]
) {
  const root = path.join(repoRoot, "packages", "design-system", "ui-primitives")
  if (!fs.existsSync(root)) {
    return
  }

  evaluateRecursiveNamingSurface(
    root,
    "packages/design-system/ui-primitives",
    issues,
    {
      allowIndexAtRoots: new Set(["packages/design-system/ui-primitives"]),
      onFile(fileName, relativePath, directoryName) {
        if (
          fileName === "README.md" ||
          fileName === "index.ts" ||
          fileName === "_registry.ts" ||
          fileName === "manifest-contract.ts"
        ) {
          return null
        }

        if (directoryName === "__tests__") {
          return validatePackageTestFile(
            "design-system primitive",
            fileName,
            relativePath
          )
        }

        if (/^[a-z0-9]+(?:-[a-z0-9]+)*\.manifest\.ts$/u.test(fileName)) {
          return null
        }

        if (/^[a-z0-9]+(?:-[a-z0-9]+)*\.tsx$/u.test(fileName)) {
          return null
        }

        return {
          severity: "error",
          rule: "design-system-primitive-name",
          path: relativePath,
          message:
            "design-system primitives must use kebab-case component files and .manifest.ts companions.",
        }
      },
    }
  )
}

function evaluateDesignSystemUtilsRoot(
  repoRoot: string,
  issues: NamingConventionIssue[]
) {
  const root = path.join(repoRoot, "packages", "design-system", "utils")
  if (!fs.existsSync(root)) {
    return
  }

  evaluateRecursiveNamingSurface(root, "packages/design-system/utils", issues, {
    allowIndexAtRoots: new Set(["packages/design-system/utils"]),
    onFile(fileName, relativePath, directoryName) {
      if (
        fileName === "README.md" ||
        fileName === "index.ts" ||
        fileName === "cn.ts"
      ) {
        return null
      }

      if (directoryName === "__tests__") {
        return validatePackageTestFile(
          "design-system utility",
          fileName,
          relativePath
        )
      }

      if (!fileName.endsWith(".ts")) {
        return null
      }

      return validateLowerRoleFile(
        "design-system utility",
        fileName,
        relativePath
      )
    },
  })
}

function evaluateDesignSystemGeneratedRoot(
  repoRoot: string,
  issues: NamingConventionIssue[]
) {
  const generatedRoot = path.join(
    repoRoot,
    "packages",
    "design-system",
    "generated"
  )
  if (fs.existsSync(generatedRoot)) {
    const generatedFiles = fs
      .readdirSync(generatedRoot, { withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)

    for (const fileName of generatedFiles) {
      const relativePath = `packages/design-system/generated/${fileName}`
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*\.json$/u.test(fileName)) {
        issues.push({
          severity: "error",
          rule: "design-system-generated-json",
          path: relativePath,
          message:
            "design-system generated JSON files must use kebab-case filenames.",
        })
      }
    }
  }

  const schemaRoot = path.join(
    repoRoot,
    "packages",
    "design-system",
    "generated",
    "schemas"
  )
  if (fs.existsSync(schemaRoot)) {
    const schemaFiles = fs
      .readdirSync(schemaRoot, { withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)

    for (const fileName of schemaFiles) {
      const relativePath = `packages/design-system/generated/schemas/${fileName}`
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*\.schema\.json$/u.test(fileName)) {
        issues.push({
          severity: "error",
          rule: "design-system-schema-json",
          path: relativePath,
          message:
            'design-system generated schemas must use "<subject>.schema.json" naming.',
        })
      }
    }
  }
}

function evaluateDesignSystemScriptsRoot(
  repoRoot: string,
  issues: NamingConventionIssue[]
) {
  evaluatePackageScriptDirectory(
    path.join(repoRoot, "packages", "design-system", "scripts"),
    "packages/design-system/scripts",
    "design-system",
    issues
  )

  const componentGovernanceRoot = path.join(
    repoRoot,
    "packages",
    "design-system",
    "scripts",
    "component-governance"
  )
  if (!fs.existsSync(componentGovernanceRoot)) {
    return
  }

  evaluateRecursiveNamingSurface(
    componentGovernanceRoot,
    "packages/design-system/scripts/component-governance",
    issues,
    {
      onFile(fileName, relativePath, directoryName) {
        if (directoryName === "__tests__") {
          return validatePackageTestFile(
            "design-system component governance",
            fileName,
            relativePath
          )
        }

        if (/^(?:check|core|generate)\.ts$/u.test(fileName)) {
          return null
        }

        return {
          severity: "error",
          rule: "design-system-component-governance-name",
          path: relativePath,
          message:
            "component-governance internals must use check.ts, core.ts, generate.ts, or package test naming.",
        }
      },
    }
  )
}

function evaluateDesignSystemArchitectureRoot(
  repoRoot: string,
  issues: NamingConventionIssue[]
) {
  const root = path.join(
    repoRoot,
    "packages",
    "design-system",
    "design-architecture"
  )
  if (!fs.existsSync(root)) {
    return
  }

  evaluateRecursiveNamingSurface(
    root,
    "packages/design-system/design-architecture",
    issues,
    {
      onFile(fileName, relativePath, directoryName) {
        if (fileName === "TOKEN_COMPONENT_CONTRACT.md") {
          return null
        }

        if (directoryName === "__tests__") {
          return validatePackageTestFile(
            "design-system architecture",
            fileName,
            relativePath
          )
        }

        if (fileName.endsWith(".css")) {
          return /^[a-z0-9]+(?:-[a-z0-9]+)*\.css$/u.test(fileName)
            ? null
            : {
                severity: "error",
                rule: "design-system-css-name",
                path: relativePath,
                message:
                  "design-system architecture stylesheets must use lowercase or kebab-case filenames.",
              }
        }

        return null
      },
    }
  )
}

function evaluateDatabaseSqlRoot(
  repoRoot: string,
  issues: NamingConventionIssue[]
) {
  evaluateWebPlatformI18nDirectory(
    path.join(repoRoot, "packages", "_database", "sql", "hardening"),
    "packages/_database/sql/hardening",
    issues,
    (fileName, relativePath) => {
      if (fileName === "README.md") {
        return
      }

      if (!/^patch_[a-z]_[a-z0-9_]+\.sql$/u.test(fileName)) {
        issues.push({
          severity: "error",
          rule: "database-hardening-patch-name",
          path: relativePath,
          message:
            "database hardening patches must use patch_<letter>_<subject>.sql naming.",
        })
      }
    }
  )
}

function evaluateDatabaseDrizzleRoot(
  repoRoot: string,
  issues: NamingConventionIssue[]
) {
  evaluateWebPlatformI18nDirectory(
    path.join(repoRoot, "packages", "_database", "drizzle"),
    "packages/_database/drizzle",
    issues,
    (fileName, relativePath) => {
      if (fileName === ".gitignore") {
        return
      }

      if (!/^\d{4}_[a-z0-9_]+\.sql$/u.test(fileName)) {
        issues.push({
          severity: "error",
          rule: "database-drizzle-migration-name",
          path: relativePath,
          message:
            "drizzle migration files must use four-digit numeric prefixes with snake_case subjects.",
        })
      }
    }
  )

  evaluateWebPlatformI18nDirectory(
    path.join(repoRoot, "packages", "_database", "drizzle", "meta"),
    "packages/_database/drizzle/meta",
    issues,
    (fileName, relativePath) => {
      if (
        fileName !== "_journal.json" &&
        !/^\d{4}_snapshot\.json$/u.test(fileName)
      ) {
        issues.push({
          severity: "error",
          rule: "database-drizzle-meta-name",
          path: relativePath,
          message:
            'drizzle meta files must use "_journal.json" or "<version>_snapshot.json" naming.',
        })
      }
    }
  )
}

function evaluateDatabaseSourceRoot(
  repoRoot: string,
  issues: NamingConventionIssue[]
) {
  const root = path.join(repoRoot, "packages", "_database", "src")
  if (!fs.existsSync(root)) {
    return
  }

  evaluateRecursiveNamingSurface(root, "packages/_database/src", issues, {
    onFile(fileName, relativePath, directoryName) {
      if (
        fileName === "README.md" ||
        fileName === "index.ts" ||
        fileName === "annotation-envelope.header.txt"
      ) {
        return null
      }

      if (directoryName === "__tests__") {
        return validatePackageTestFile("database", fileName, relativePath)
      }

      if (fileName.endsWith(".snapshot.json")) {
        return /^[a-z0-9]+(?:-[a-z0-9]+)*\.snapshot\.json$/u.test(fileName)
          ? null
          : {
              severity: "error",
              rule: "database-snapshot-name",
              path: relativePath,
              message:
                'database snapshots must use "<subject>.snapshot.json" naming.',
            }
      }

      if (fileName === "_schema.ts") {
        return null
      }

      if (!fileName.endsWith(".ts")) {
        return null
      }

      return validateLowerRoleFile("database", fileName, relativePath)
    },
  })
}

function evaluateRecursiveNamingSurface(
  absoluteRoot: string,
  relativeRoot: string,
  issues: NamingConventionIssue[],
  options: {
    allowIndexAtRoots?: ReadonlySet<string>
    ignoredDirectoryNames?: ReadonlySet<string>
    onFile: (
      fileName: string,
      relativePath: string,
      directoryName: string
    ) => NamingConventionIssue | null
  }
) {
  const pending = [{ absoluteRoot, relativeRoot }]

  while (pending.length > 0) {
    const next = pending.pop()
    if (!next) {
      continue
    }

    const entries = fs.readdirSync(next.absoluteRoot, { withFileTypes: true })
    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (entry.name === "__test__") {
          issues.push({
            severity: "error",
            rule: "singular-test-directory",
            path: `${next.relativeRoot}/${entry.name}`,
            message:
              'Test directories in governed surfaces must use "__tests__". Singular "__test__" is not allowed.',
          })
        }
        if (options.ignoredDirectoryNames?.has(entry.name)) {
          continue
        }
        pending.push({
          absoluteRoot: path.join(next.absoluteRoot, entry.name),
          relativeRoot: `${next.relativeRoot}/${entry.name}`,
        })
        continue
      }

      const fileName = entry.name
      const relativePath = `${next.relativeRoot}/${fileName}`

      if (
        fileName === "index.ts" &&
        options.allowIndexAtRoots?.has(next.relativeRoot)
      ) {
        continue
      }

      evaluateGenericAndRoleOnlyName(fileName, relativePath, issues)
      const issue = options.onFile(
        fileName,
        relativePath,
        path.basename(next.relativeRoot)
      )
      if (issue) {
        issues.push(issue)
      }
    }
  }
}

function validateKebabCaseFile(
  domainLabel: string,
  fileName: string,
  relativePath: string
): NamingConventionIssue | null {
  if (!KEBAB_CASE_STEM_PATTERN.test(stripExtension(fileName))) {
    return {
      severity: "error",
      rule: `${domainLabel}-kebab-case`,
      path: relativePath,
      message: `${domainLabel} filenames must use kebab-case in the bounded Phase 2 naming domain.`,
    }
  }
  return null
}

function validateLowerRoleFile(
  domainLabel: string,
  fileName: string,
  relativePath: string
): NamingConventionIssue | null {
  if (!LOWER_ROLE_STEM_PATTERN.test(stripExtension(fileName))) {
    return {
      severity: "error",
      rule: `${domainLabel}-lower-role`,
      path: relativePath,
      message: `${domainLabel} filenames must use lower-case kebab naming with optional dotted role suffixes in the bounded Phase 2 naming domain.`,
    }
  }
  return null
}

function validateHookFile(
  domainLabel: string,
  fileName: string,
  relativePath: string
): NamingConventionIssue | null {
  if (!/^use-[a-z0-9]+(?:-[a-z0-9]+)*\.tsx?$/u.test(fileName)) {
    return {
      severity: "error",
      rule: `${domainLabel}-hook-prefix`,
      path: relativePath,
      message: `${domainLabel} hook modules must use "use-<subject>.ts[x]" naming in the bounded Phase 2 naming domain.`,
    }
  }
  return null
}

function validateLocalScriptFile(
  domainLabel: string,
  fileName: string,
  relativePath: string
): NamingConventionIssue | null {
  if (!LOCAL_SCRIPT_ENTRYPOINT_PATTERN.test(fileName)) {
    return {
      severity: "error",
      rule: `${domainLabel}-script-verb-first`,
      path: relativePath,
      message: `Local ${domainLabel} scripts must start with an approved verb and use "<action>-<subject>" naming.`,
    }
  }
  return null
}

function validateTestFile(
  domainLabel: string,
  fileName: string,
  relativePath: string
): NamingConventionIssue | null {
  if (!TEST_FILE_PATTERN.test(fileName)) {
    return {
      severity: "error",
      rule: `${domainLabel}-test-suffix`,
      path: relativePath,
      message: `${domainLabel} unit and integration tests must use "<subject>.test.ts[x]" naming in the bounded Phase 2 naming domain.`,
    }
  }
  return null
}

function evaluateWebPlatformI18nDirectory(
  absoluteRoot: string,
  relativeRoot: string,
  issues: NamingConventionIssue[],
  evaluateFile: (fileName: string, relativePath: string) => void
) {
  if (!fs.existsSync(absoluteRoot)) {
    return
  }

  const files = fs
    .readdirSync(absoluteRoot, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)

  for (const fileName of files) {
    const relativePath = `${relativeRoot}/${fileName}`
    evaluateGenericAndRoleOnlyName(fileName, relativePath, issues)
    evaluateFile(fileName, relativePath)
  }
}

function evaluateGenericAndRoleOnlyName(
  fileName: string,
  relativePath: string,
  issues: NamingConventionIssue[]
) {
  const identity = describeFilenameIdentity(fileName)
  if (!identity) {
    return
  }

  if (identity.isRoleOnly) {
    issues.push({
      severity: "error",
      rule: "role-without-subject",
      path: relativePath,
      message:
        "Governed filenames must include a subject and may not consist only of an artifact role.",
    })
    return
  }

  if (BANNED_GENERIC_SUBJECTS.has(identity.primarySubject)) {
    issues.push({
      severity: "error",
      rule: "generic-name",
      path: relativePath,
      message:
        "Generic or catch-all filenames are not allowed in controlled naming domains.",
    })
  }
}

function getRootEntrypointFiles(
  rootPackageScripts: Record<string, string>
): ReadonlySet<string> {
  const files = new Set<string>()

  for (const command of Object.values(rootPackageScripts)) {
    const match = command.match(/^tsx scripts\/([^/]+\.(?:ts|tsx))$/u)
    if (match) {
      files.add(match[1])
    }
  }

  return files
}

function describeFilenameIdentity(fileName: string): {
  readonly primarySubject: string
  readonly isRoleOnly: boolean
} | null {
  const stem = stripExtension(fileName)
  const parts = stem.split(".")
  const trailing = parts.at(-1)
  const hasRoleSuffix = Boolean(trailing && ROLE_SUFFIXES.has(trailing))

  const subjectStem = hasRoleSuffix ? parts.slice(0, -1).join(".") : stem

  if (
    !subjectStem ||
    subjectStem === "README" ||
    subjectStem.endsWith("_TEMPLATE")
  ) {
    if (hasRoleSuffix && subjectStem.length === 0) {
      return {
        primarySubject: trailing ?? "",
        isRoleOnly: true,
      }
    }

    return null
  }

  return {
    primarySubject:
      subjectStem.split(/[-_.]/u).filter(Boolean)[0]?.toLowerCase() ?? "",
    isRoleOnly: false,
  }
}

function stripExtension(fileName: string): string {
  return fileName.replace(/\.[^.]+$/u, "")
}

function toPosixPath(value: string): string {
  return value.split(path.sep).join("/")
}
