/**
 * Runtime provider/bootstrap checker.
 *
 * Verifies app bootstrap and shell composition satisfy shellContextPolicy
 * and shellPolicy from the governed constant layer:
 * - auth / shell / tenant / user / locale / theme providers
 * - shell runtime contexts for navigation / command / density / metadata
 *
 * Usage:
 *   pnpm run script:check-runtime-providers
 *   pnpm run script:check-runtime-providers --format=json
 */

import path from 'node:path'
import process from 'node:process'
import { readFileSync } from 'node:fs'
import type {
  AstFinding,
  GovernanceModules,
  ShellContextPolicyShape,
  ShellPolicyShape,
  ShellComponentContractShape,
  RulePolicyShape,
} from '../tools/ui-drift/shared/index.js'
import {
  findRepoRoot,
  normalizePath,
  getOutputFormat,
  getRuleLevel,
  buildRuleCounts,
  truncateExcerpt,
  listFilesForScan,
} from '../tools/ui-drift/shared/index.js'

type RuleCode =
  | 'UIX-RUNTIME-001'
  | 'UIX-RUNTIME-002'
  | 'UIX-RUNTIME-003'
  | 'UIX-RUNTIME-004'
  | 'UIX-RUNTIME-005'
  | 'UIX-RUNTIME-006'
  | 'UIX-RUNTIME-007'
  | 'UIX-RUNTIME-008'
  | 'UIX-RUNTIME-009'
  | 'UIX-RUNTIME-010'
  | 'UIX-RUNTIME-011'

interface IndexedFile {
  relativePath: string
  content: string
}

const ROOT_DIR = normalizePath(findRepoRoot())
const findings: AstFinding[] = []

const _BOOTSTRAP_FILE_CANDIDATES = [
  'apps/web/src/main.tsx',
  'apps/web/src/main.ts',
  'apps/web/src/App.tsx',
  'apps/web/src/app/App.tsx',
  'apps/web/src/app-shell/AppShell.tsx',
  'apps/web/src/shell/AppShell.tsx',
]

const PROVIDER_SIGNAL_MAP = {
  shellProvider: [
    'ShellProvider',
    'AppShellProvider',
    'ShellContextProvider',
    'ShellMetadataProvider',
  ],
  authProvider: [
    'AuthProvider',
    'SessionProvider',
    'AuthContextProvider',
    'Auth0Provider',
  ],
  localeProvider: [
    'I18nextProvider',
    'LocaleProvider',
    'LanguageProvider',
    'initI18n',
  ],
  themeProvider: [
    'ThemeProvider',
    'AppearanceProvider',
    'ColorSchemeProvider',
  ],
  tenantProvider: [
    'TenantProvider',
    'TenantContextProvider',
    'WorkspaceProvider',
  ],
  userProvider: [
    'UserProvider',
    'UserContextProvider',
    'CurrentUserProvider',
  ],
  shellMetadataProvider: [
    'ShellMetadataProvider',
    'AppShellMetadataProvider',
    'ShellStateProvider',
  ],
  navigationContext: [
    'NavigationProvider',
    'NavProvider',
    'SidebarProvider',
  ],
  commandContext: [
    'CommandProvider',
    'CommandPaletteProvider',
    'CommandMenuProvider',
  ],
  densityContext: [
    'DensityProvider',
    'LayoutDensityProvider',
  ],
  viewportContext: [
    'ViewportProvider',
    'ResponsiveProvider',
    'BreakpointProvider',
  ],
} as const

// ---------------------------------------------------------------------------

async function loadGovernance(): Promise<GovernanceModules<RuleCode>> {
  const { loadGovernanceModules } = await import('../tools/ui-drift/shared/index.js')
  return loadGovernanceModules<RuleCode>(ROOT_DIR)
}

// ---------------------------------------------------------------------------

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function fileContainsAnySignal(file: IndexedFile, signals: readonly string[]): boolean {
  for (const signal of signals) {
    const re = new RegExp(`\\b${escapeRegExp(signal)}\\b`)
    if (re.test(file.content)) return true
  }
  return false
}

function anyFileContainsSignal(files: IndexedFile[], signals: readonly string[]): boolean {
  return files.some((file) => fileContainsAnySignal(file, signals))
}

function pushFinding(
  file: IndexedFile,
  rule: RuleCode,
  message: string,
  rulePolicy: RulePolicyShape<RuleCode>,
  excerptOverride?: string,
) {
  const severity = getRuleLevel(rule, rulePolicy)
  if (severity == null) return

  findings.push({
    severity,
    rule,
    file: file.relativePath,
    line: 1,
    column: 1,
    message,
    excerpt: truncateExcerpt(excerptOverride ?? '(bootstrap-level signal check)'),
  })
}

// ---------------------------------------------------------------------------

function checkRequiredProviders(
  files: IndexedFile[],
  ctx: ShellContextPolicyShape,
  shell: ShellPolicyShape,
  rulePolicy: RulePolicyShape<RuleCode>,
) {
  const checks: Array<{
    enabled: boolean
    rule: RuleCode
    message: string
    signals: readonly string[]
  }> = [
    {
      enabled: ctx.requireShellProvider,
      rule: 'UIX-RUNTIME-001',
      message: 'shellContextPolicy requires a shell provider, but no ShellProvider-like bootstrap signal was found.',
      signals: PROVIDER_SIGNAL_MAP.shellProvider,
    },
    {
      enabled: ctx.requireAuthProvider,
      rule: 'UIX-RUNTIME-002',
      message: 'shellContextPolicy requires an auth/session provider, but no AuthProvider-like bootstrap signal was found.',
      signals: PROVIDER_SIGNAL_MAP.authProvider,
    },
    {
      enabled: ctx.requireLocaleProvider,
      rule: 'UIX-RUNTIME-003',
      message: 'shellContextPolicy requires a locale/i18n provider, but no LocaleProvider-like bootstrap signal was found.',
      signals: PROVIDER_SIGNAL_MAP.localeProvider,
    },
    {
      enabled: ctx.requireThemeProvider,
      rule: 'UIX-RUNTIME-004',
      message: 'shellContextPolicy requires a theme provider, but no ThemeProvider-like bootstrap signal was found.',
      signals: PROVIDER_SIGNAL_MAP.themeProvider,
    },
    {
      enabled: shell.requireShellMetadataProvider,
      rule: 'UIX-RUNTIME-005',
      message: 'shellPolicy requires shell metadata context, but no ShellMetadataProvider-like bootstrap signal was found.',
      signals: PROVIDER_SIGNAL_MAP.shellMetadataProvider,
    },
  ]

  for (const check of checks) {
    if (!check.enabled) continue
    if (anyFileContainsSignal(files, check.signals)) continue

    pushFinding(
      files[0],
      check.rule,
      check.message,
      rulePolicy,
      `Missing required runtime provider signals: ${check.signals.join(', ')}`,
    )
  }
}

function checkTenantScopeDiscipline(
  files: IndexedFile[],
  ctx: ShellContextPolicyShape,
  rulePolicy: RulePolicyShape<RuleCode>,
) {
  if (ctx.defaultShellScope !== 'tenant') return

  if (ctx.requireTenantProviderInTenantScope) {
    if (!anyFileContainsSignal(files, PROVIDER_SIGNAL_MAP.tenantProvider)) {
      pushFinding(
        files[0],
        'UIX-RUNTIME-006',
        'Tenant shell scope requires a tenant provider, but no TenantProvider-like signal was found.',
        rulePolicy,
        `Missing tenant provider signals: ${PROVIDER_SIGNAL_MAP.tenantProvider.join(', ')}`,
      )
    }
  }

  if (ctx.requireUserProviderInTenantScope) {
    if (!anyFileContainsSignal(files, PROVIDER_SIGNAL_MAP.userProvider)) {
      pushFinding(
        files[0],
        'UIX-RUNTIME-007',
        'Tenant shell scope requires a user/current-user provider, but no UserProvider-like signal was found.',
        rulePolicy,
        `Missing user provider signals: ${PROVIDER_SIGNAL_MAP.userProvider.join(', ')}`,
      )
    }
  }

  if (ctx.requireTenantIsolationBinding) {
    const tenantSignals = [
      ...PROVIDER_SIGNAL_MAP.tenantProvider,
      'tenantId',
      'bindTenant',
      'TenantScope',
      'TenantBoundary',
    ]
    if (!anyFileContainsSignal(files, tenantSignals)) {
      pushFinding(
        files[0],
        'UIX-RUNTIME-008',
        'Tenant shell scope requires tenant isolation binding, but no tenant-boundary or tenantId signal was found.',
        rulePolicy,
        `Missing tenant isolation signals: ${tenantSignals.join(', ')}`,
      )
    }
  }
}

function checkOperatorScopeSeparation(
  files: IndexedFile[],
  ctx: ShellContextPolicyShape,
  rulePolicy: RulePolicyShape<RuleCode>,
) {
  if (!ctx.requireOperatorScopeSeparation) return
  if (ctx.defaultShellScope !== 'operator') return

  const operatorSignals = [
    'OperatorShell',
    'OperatorProvider',
    'AdminShell',
    'AdminProvider',
  ]

  if (anyFileContainsSignal(files, operatorSignals)) return

  pushFinding(
    files[0],
    'UIX-RUNTIME-009',
    'Operator shell scope requires explicit operator/admin shell separation, but no operator-specific shell signal was found.',
    rulePolicy,
    `Missing operator scope signals: ${operatorSignals.join(', ')}`,
  )
}

function checkShellContextRequirements(
  files: IndexedFile[],
  shell: ShellPolicyShape,
  rulePolicy: RulePolicyShape<RuleCode>,
) {
  const checks: Array<{
    enabled: boolean
    rule: RuleCode
    message: string
    signals: readonly string[]
  }> = [
    {
      enabled: shell.requireNavigationContext,
      rule: 'UIX-RUNTIME-010',
      message: 'shellPolicy requires navigation context, but no NavigationProvider-like signal was found.',
      signals: PROVIDER_SIGNAL_MAP.navigationContext,
    },
    {
      enabled: shell.requireCommandInfrastructure,
      rule: 'UIX-RUNTIME-010',
      message:
        'shellPolicy requires command infrastructure, but no CommandPaletteProvider-like signal was found.',
      signals: PROVIDER_SIGNAL_MAP.commandContext,
    },
    {
      enabled: shell.requireLayoutDensityContext,
      rule: 'UIX-RUNTIME-010',
      message: 'shellPolicy requires layout density context, but no DensityProvider-like signal was found.',
      signals: PROVIDER_SIGNAL_MAP.densityContext,
    },
    {
      enabled: shell.requireResponsiveShellLayout,
      rule: 'UIX-RUNTIME-010',
      message:
        'shellPolicy requires responsive shell layout, but no ViewportProvider-like signal was found.',
      signals: PROVIDER_SIGNAL_MAP.viewportContext,
    },
  ]

  for (const check of checks) {
    if (!check.enabled) continue
    if (anyFileContainsSignal(files, check.signals)) continue

    pushFinding(
      files[0],
      check.rule,
      check.message,
      rulePolicy,
      `Missing shell context signals: ${check.signals.join(', ')}`,
    )
  }
}

function checkShellComponentContractRequirements(
  files: IndexedFile[],
  shellComponentContract: ShellComponentContractShape,
  rulePolicy: RulePolicyShape<RuleCode>,
) {
  const requirementChecks: Array<{
    dependencyName: string
    selector: (
      entry: ShellComponentContractShape[string],
    ) => 'none' | 'optional' | 'required'
    signals: readonly string[]
  }> = [
    {
      dependencyName: 'shell metadata context',
      selector: (entry) => entry.participation.shellMetadata,
      signals: PROVIDER_SIGNAL_MAP.shellMetadataProvider,
    },
    {
      dependencyName: 'navigation context',
      selector: (entry) => entry.participation.navigationContext,
      signals: PROVIDER_SIGNAL_MAP.navigationContext,
    },
    {
      dependencyName: 'command infrastructure',
      selector: (entry) => entry.participation.commandInfrastructure,
      signals: PROVIDER_SIGNAL_MAP.commandContext,
    },
    {
      dependencyName: 'layout density context',
      selector: (entry) => entry.participation.layoutDensity,
      signals: PROVIDER_SIGNAL_MAP.densityContext,
    },
    {
      dependencyName: 'responsive shell layout context',
      selector: (entry) => entry.participation.responsiveShell,
      signals: PROVIDER_SIGNAL_MAP.viewportContext,
    },
  ]

  for (const check of requirementChecks) {
    const requiredBy = Object.entries(shellComponentContract)
      .filter(([_, entry]) => entry.shellAware && check.selector(entry) === 'required')
      .map(([componentKey]) => componentKey)

    if (requiredBy.length === 0) continue
    if (anyFileContainsSignal(files, check.signals)) continue

    pushFinding(
      files[0],
      'UIX-RUNTIME-011',
      `Shell component contract requires ${check.dependencyName}, but no matching provider bootstrap signal was found.`,
      rulePolicy,
      `Required by: ${requiredBy.join(', ')}; missing signals: ${check.signals.join(', ')}`,
    )
  }
}

// ---------------------------------------------------------------------------

async function main() {
  const governance = await loadGovernance()

  const allFiles = listFilesForScan(ROOT_DIR)
  const indexedFiles: IndexedFile[] = allFiles.map((file) => {
    const content = readFileSync(file, 'utf8')
    return {
      relativePath: normalizePath(path.relative(ROOT_DIR, file)),
      content,
    }
  })

  const appFiles = indexedFiles.filter((file) => file.relativePath.startsWith('apps/web/src/'))

  const scanPool = appFiles.length > 0 ? appFiles : indexedFiles

  checkRequiredProviders(scanPool, governance.shellContextPolicy, governance.shellPolicy, governance.rulePolicy)
  checkTenantScopeDiscipline(scanPool, governance.shellContextPolicy, governance.rulePolicy)
  checkOperatorScopeSeparation(scanPool, governance.shellContextPolicy, governance.rulePolicy)
  checkShellContextRequirements(scanPool, governance.shellPolicy, governance.rulePolicy)
  checkShellComponentContractRequirements(scanPool, governance.shellComponentContract, governance.rulePolicy)

  const format = getOutputFormat()

  const sorted = [...findings].sort((a, b) =>
    a.file.localeCompare(b.file) || a.line - b.line || a.column - b.column || a.rule.localeCompare(b.rule),
  )

  const errors = sorted.filter((f) => f.severity === 'error')
  const warnings = sorted.filter((f) => f.severity === 'warning')
  const ruleCounts = buildRuleCounts(sorted)

  if (format === 'json') {
    console.log(
      JSON.stringify(
        { findings: sorted, summary: { errors: errors.length, warnings: warnings.length, byRule: ruleCounts } },
        null,
        2,
      ),
    )
    process.exit(errors.length > 0 ? 1 : 0)
  }

  if (sorted.length === 0) {
    console.log('✅ Runtime provider/bootstrap check passed. No violations found.')
    process.exit(0)
  }

  console.log('Runtime Provider / Bootstrap Report')
  console.log('===================================\n')

  for (const finding of sorted) {
    console.log(`[${finding.severity.toUpperCase()}] ${finding.rule} ${finding.file}:${finding.line}:${finding.column}`)
    console.log(`  ${finding.message}`)
    console.log(`  ${finding.excerpt}`)
    console.log('')
  }

  console.log('Summary')
  console.log('-------')
  console.log(`Errors: ${errors.length}`)
  console.log(`Warnings: ${warnings.length}`)

  if (Object.keys(ruleCounts).length > 0) {
    console.log('\nBy rule')
    console.log('-------')
    for (const [rule, count] of Object.entries(ruleCounts).sort((a, b) => a[0].localeCompare(b[0]))) {
      console.log(`${rule}: ${count}`)
    }
  }

  process.exit(errors.length > 0 ? 1 : 0)
}

void main()
