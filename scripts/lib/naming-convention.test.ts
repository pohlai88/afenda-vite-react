import assert from "node:assert/strict"
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs"
import os from "node:os"
import path from "node:path"
import test from "node:test"

import {
  evaluateNamingConvention,
  getNamingGovernedRoots,
} from "./naming-convention.js"

test("governed-root registry preserves the current covered roots", () => {
  const governedRoots = getNamingGovernedRoots()

  assert.deepEqual(
    governedRoots.map((root) => root.id),
    [
      "scripts-root",
      "governance-docs",
      "adr-docs",
      "atc-docs",
      "api-contract-surface",
      "web-platform-i18n",
      "web-platform-runtime",
      "web-platform-tenant",
      "web-platform-theme",
      "web-platform-config",
      "web-platform-app-surface",
      "web-platform-auth",
      "web-platform-shell",
      "web-app-components",
      "web-app-features",
      "web-routes",
      "web-share",
      "web-rpc",
      "web-marketing",
      "pkg-contracts",
      "pkg-env-loader",
      "pkg-pino-logger",
      "pkg-better-auth",
      "pkg-vitest-config",
      "pkg-eslint-config",
      "pkg-design-system",
      "pkg-database",
    ]
  )

  assert.deepEqual(
    governedRoots.map((root) => root.relativeRoot),
    [
      "scripts",
      "docs/architecture/governance",
      "docs/architecture/adr",
      "docs/architecture/atc",
      "apps/api/src/contract",
      "apps/web/src/app/_platform/i18n",
      "apps/web/src/app/_platform/runtime",
      "apps/web/src/app/_platform/tenant",
      "apps/web/src/app/_platform/theme",
      "apps/web/src/app/_platform/config",
      "apps/web/src/app/_platform/app-surface",
      "apps/web/src/app/_platform/auth",
      "apps/web/src/app/_platform/shell",
      "apps/web/src/app/_components",
      "apps/web/src/app/_features",
      "apps/web/src/routes",
      "apps/web/src/share",
      "apps/web/src/rpc",
      "apps/web/src/marketing",
      "packages/contracts/src",
      "packages/env-loader/src",
      "packages/pino-logger/src",
      "packages/better-auth",
      "packages/vitest-config",
      "packages/eslint-config/src",
      "packages/design-system",
      "packages/_database",
    ]
  )
})

test("governed-root registry carries required machine-noise exclusions", () => {
  const governedRoots = getNamingGovernedRoots()

  for (const root of governedRoots) {
    assert.ok(root.excludePatterns.includes("node_modules/**"))
    assert.ok(root.excludePatterns.includes(".artifacts/**"))
    assert.ok(root.excludePatterns.includes(".turbo/**"))
    assert.ok(root.excludePatterns.includes("coverage/**"))
  }
})

test("controlled domains pass with valid naming", () => {
  const repoRoot = createFixtureRepo({
    "package.json": JSON.stringify(
      {
        name: "fixture",
        private: true,
        scripts: {
          "script:check-governance-registry":
            "tsx scripts/governance/check-governance-registry.ts",
        },
      },
      null,
      2
    ),
    "scripts/governance/check-governance-registry.ts": "console.log('ok')",
    "docs/architecture/governance/NAMING_CONVENTION.md": "# Naming",
    "docs/architecture/adr/ADR_TEMPLATE.md": "# Template",
    "docs/architecture/adr/ADR-0001-core-web-architecture-baseline.md": "# ADR",
    "docs/architecture/atc/ATC_TEMPLATE.md": "# Template",
    "docs/architecture/atc/ATC-0001-core-web-architecture-baseline.md": "# ATC",
  })

  try {
    const result = evaluateNamingConvention(repoRoot, {
      "script:check-governance-registry":
        "tsx scripts/governance/check-governance-registry.ts",
    })

    assert.equal(result.errors.length, 0)
  } finally {
    cleanupFixtureRepo(repoRoot)
  }
})

test("generic and role-only names fail", () => {
  const repoRoot = createFixtureRepo({
    "package.json": JSON.stringify(
      {
        name: "fixture",
        private: true,
        scripts: {
          "script:check-governance-registry":
            "tsx scripts/governance/check-governance-registry.ts",
        },
      },
      null,
      2
    ),
    "scripts/governance/check-governance-registry.ts": "console.log('ok')",
    "docs/architecture/governance/policy.md": "# bad",
    "docs/architecture/adr/ADR_TEMPLATE.md": "# Template",
    "docs/architecture/atc/ATC_TEMPLATE.md": "# Template",
  })

  try {
    const result = evaluateNamingConvention(repoRoot, {
      "script:check-governance-registry":
        "tsx scripts/governance/check-governance-registry.ts",
    })

    const messages = result.errors.map((issue) => issue.message).join("\n")
    assert.match(messages, /artifact role/u)
  } finally {
    cleanupFixtureRepo(repoRoot)
  }
})

test("invalid ADR and ATC filenames fail", () => {
  const repoRoot = createFixtureRepo({
    "package.json": JSON.stringify({ name: "fixture", private: true }, null, 2),
    "docs/architecture/governance/NAMING_CONVENTION.md": "# Naming",
    "docs/architecture/adr/ADR_TEMPLATE.md": "# Template",
    "docs/architecture/adr/architecture-baseline.md": "# bad",
    "docs/architecture/atc/ATC_TEMPLATE.md": "# Template",
    "docs/architecture/atc/topology.md": "# bad",
  })

  try {
    const result = evaluateNamingConvention(repoRoot, {})
    const messages = result.errors.map((issue) => issue.message).join("\n")

    assert.match(messages, /ADR filenames must use/u)
    assert.match(messages, /ATC filenames must use/u)
  } finally {
    cleanupFixtureRepo(repoRoot)
  }
})

test("root script entrypoints must be verb-first", () => {
  const repoRoot = createFixtureRepo({
    "package.json": JSON.stringify(
      {
        name: "fixture",
        private: true,
        scripts: {
          "script:node-info": "tsx scripts/node-info.ts",
        },
      },
      null,
      2
    ),
    "scripts/node-info.ts": "console.log('ok')",
    "docs/architecture/governance/NAMING_CONVENTION.md": "# Naming",
    "docs/architecture/adr/ADR_TEMPLATE.md": "# Template",
    "docs/architecture/atc/ATC_TEMPLATE.md": "# Template",
  })

  try {
    const result = evaluateNamingConvention(repoRoot, {
      "script:node-info": "tsx scripts/node-info.ts",
    })

    assert.match(
      result.errors.map((issue) => issue.message).join("\n"),
      /Root script entrypoints must use/u
    )
  } finally {
    cleanupFixtureRepo(repoRoot)
  }
})

test("index files warn but do not block", () => {
  const repoRoot = createFixtureRepo({
    "package.json": JSON.stringify({ name: "fixture", private: true }, null, 2),
    "scripts/index.ts": "console.log('ok')",
    "docs/architecture/governance/NAMING_CONVENTION.md": "# Naming",
    "docs/architecture/adr/ADR_TEMPLATE.md": "# Template",
    "docs/architecture/atc/ATC_TEMPLATE.md": "# Template",
  })

  try {
    const result = evaluateNamingConvention(repoRoot, {})

    assert.equal(result.errors.length, 0)
    assert.match(
      result.warnings.map((issue) => issue.message).join("\n"),
      /avoid index entrypoints/u
    )
  } finally {
    cleanupFixtureRepo(repoRoot)
  }
})

test("api contract surface rejects weak contract filenames", () => {
  const repoRoot = createFixtureRepo({
    "package.json": JSON.stringify({ name: "fixture", private: true }, null, 2),
    "docs/architecture/governance/NAMING_CONVENTION.md": "# Naming",
    "docs/architecture/adr/ADR_TEMPLATE.md": "# Template",
    "docs/architecture/atc/ATC_TEMPLATE.md": "# Template",
    "apps/api/src/contract/envelope.ts": "export type Envelope = {}",
    "apps/api/src/contract/request-context.ts":
      "export type RequestContext = {}",
    "apps/api/src/contract/user.ts": "export type User = {}",
  })

  try {
    const result = evaluateNamingConvention(repoRoot, {})
    const messages = result.errors.map((issue) => issue.message).join("\n")

    assert.match(messages, /API contract modules must use/u)
  } finally {
    cleanupFixtureRepo(repoRoot)
  }
})

test("api contract surface passes with explicit contract role naming", () => {
  const repoRoot = createFixtureRepo({
    "package.json": JSON.stringify({ name: "fixture", private: true }, null, 2),
    "docs/architecture/governance/NAMING_CONVENTION.md": "# Naming",
    "docs/architecture/adr/ADR_TEMPLATE.md": "# Template",
    "docs/architecture/atc/ATC_TEMPLATE.md": "# Template",
    "apps/api/src/contract/http-envelope.contract.ts":
      "export type HttpEnvelopeContract = {}",
    "apps/api/src/contract/request-context.contract.ts":
      "export type RequestContextContract = {}",
    "apps/api/src/contract/user.contract.ts": "export type UserContract = {}",
  })

  try {
    const result = evaluateNamingConvention(repoRoot, {})
    assert.equal(result.errors.length, 0)
  } finally {
    cleanupFixtureRepo(repoRoot)
  }
})

test("bounded i18n Phase 2 surface passes with valid naming", () => {
  const repoRoot = createFixtureRepo({
    "package.json": JSON.stringify({ name: "fixture", private: true }, null, 2),
    "docs/architecture/governance/NAMING_CONVENTION.md": "# Naming",
    "docs/architecture/adr/ADR_TEMPLATE.md": "# Template",
    "docs/architecture/atc/ATC_TEMPLATE.md": "# Template",
    "apps/web/src/app/_platform/i18n/index.ts":
      "export * from './policy/i18n-policy'",
    "apps/web/src/app/_platform/i18n/components/language-switcher.tsx":
      "export function LanguageSwitcher() { return null }",
    "apps/web/src/app/_platform/i18n/adapters/i18next-adapter.ts":
      "export const i18n = {}",
    "apps/web/src/app/_platform/i18n/services/i18n-format-service.ts":
      "export function formatNumber() { return '' }",
    "apps/web/src/app/_platform/i18n/policy/i18n-policy.ts":
      "export const SUPPORTED_LOCALES = ['en']",
    "apps/web/src/app/_platform/i18n/policy/i18n-unused-key-lifecycle.json":
      "{}",
    "apps/web/src/app/_platform/i18n/scripts/check-i18n-policy.ts":
      "console.log('ok')",
    "apps/web/src/app/_platform/i18n/types/i18n-types.d.ts":
      "export type Locale = 'en'",
    "apps/web/src/app/_platform/i18n/__tests__/policy-script.test.ts":
      "export {}",
  })

  try {
    const result = evaluateNamingConvention(repoRoot, {})
    assert.equal(result.errors.length, 0)
  } finally {
    cleanupFixtureRepo(repoRoot)
  }
})

test("bounded i18n Phase 2 surface rejects invalid role naming", () => {
  const repoRoot = createFixtureRepo({
    "package.json": JSON.stringify({ name: "fixture", private: true }, null, 2),
    "docs/architecture/governance/NAMING_CONVENTION.md": "# Naming",
    "docs/architecture/adr/ADR_TEMPLATE.md": "# Template",
    "docs/architecture/atc/ATC_TEMPLATE.md": "# Template",
    "apps/web/src/app/_platform/i18n/components/ErpModulePage.tsx":
      "export function ErpModulePage() { return null }",
    "apps/web/src/app/_platform/i18n/adapters/i18next.ts":
      "export const i18n = {}",
    "apps/web/src/app/_platform/i18n/services/i18n-format.ts":
      "export function formatNumber() { return '' }",
    "apps/web/src/app/_platform/i18n/policy/policy.ts":
      "export const SUPPORTED_LOCALES = ['en']",
    "apps/web/src/app/_platform/i18n/scripts/i18n.ts": "console.log('bad')",
    "apps/web/src/app/_platform/i18n/types/i18n.d.ts":
      "export type Locale = 'en'",
    "apps/web/src/app/_platform/i18n/__tests__/policy-script.spec.ts":
      "export {}",
  })

  try {
    const result = evaluateNamingConvention(repoRoot, {})
    const messages = result.errors.map((issue) => issue.message).join("\n")

    assert.match(messages, /component filenames must use kebab-case/u)
    assert.match(messages, /adapter filenames must end with "-adapter\.ts"/u)
    assert.match(messages, /service filenames must end with "-service\.ts"/u)
    assert.match(messages, /policy modules must end with "-policy\.ts"/u)
    assert.match(
      messages,
      /Local i18n scripts must start with an approved verb/u
    )
    assert.match(messages, /declaration files must end with "-types\.d\.ts"/u)
    assert.match(messages, /must use "<subject>\.test\.ts\[x\]" naming/u)
  } finally {
    cleanupFixtureRepo(repoRoot)
  }
})

test("bounded runtime Phase 2 surface passes with valid naming", () => {
  const repoRoot = createFixtureRepo({
    "package.json": JSON.stringify({ name: "fixture", private: true }, null, 2),
    "docs/architecture/governance/NAMING_CONVENTION.md": "# Naming",
    "docs/architecture/adr/ADR_TEMPLATE.md": "# Template",
    "docs/architecture/atc/ATC_TEMPLATE.md": "# Template",
    "apps/web/src/app/_platform/runtime/index.ts":
      "export * from './services/api-client-service'",
    "apps/web/src/app/_platform/runtime/components/api-client-boundary.tsx":
      "export function ApiClientBoundary() { return null }",
    "apps/web/src/app/_platform/runtime/adapters/fetch-adapter.ts":
      "export const fetchAdapter = {}",
    "apps/web/src/app/_platform/runtime/hooks/use-api-client.ts":
      "export function useApiClient() { return null }",
    "apps/web/src/app/_platform/runtime/policy/api-client-policy.ts":
      "export const apiClientPlatformPolicy = {}",
    "apps/web/src/app/_platform/runtime/scripts/generate-api-client-capability-report.ts":
      "export function createApiClientCapabilityReport() { return {} }",
    "apps/web/src/app/_platform/runtime/services/api-client-service.ts":
      "export function createApiClient() { return {} }",
    "apps/web/src/app/_platform/runtime/types/api-client-types.ts":
      "export type ApiClient = {}",
    "apps/web/src/app/_platform/runtime/__tests__/api-client-policy.test.ts":
      "export {}",
  })

  try {
    const result = evaluateNamingConvention(repoRoot, {})
    assert.equal(result.errors.length, 0)
  } finally {
    cleanupFixtureRepo(repoRoot)
  }
})

test("bounded runtime Phase 2 surface rejects invalid role naming", () => {
  const repoRoot = createFixtureRepo({
    "package.json": JSON.stringify({ name: "fixture", private: true }, null, 2),
    "docs/architecture/governance/NAMING_CONVENTION.md": "# Naming",
    "docs/architecture/adr/ADR_TEMPLATE.md": "# Template",
    "docs/architecture/atc/ATC_TEMPLATE.md": "# Template",
    "apps/web/src/app/_platform/runtime/components/ApiClientBoundary.tsx":
      "export function ApiClientBoundary() { return null }",
    "apps/web/src/app/_platform/runtime/adapters/fetch.ts":
      "export const fetchAdapter = {}",
    "apps/web/src/app/_platform/runtime/hooks/api-client.ts":
      "export function useApiClient() { return null }",
    "apps/web/src/app/_platform/runtime/policy/policy.ts":
      "export const apiClientPlatformPolicy = {}",
    "apps/web/src/app/_platform/runtime/scripts/api-client-capability-report.ts":
      "export function createApiClientCapabilityReport() { return {} }",
    "apps/web/src/app/_platform/runtime/services/api-client.ts":
      "export function createApiClient() { return {} }",
    "apps/web/src/app/_platform/runtime/types/api-client.ts":
      "export type ApiClient = {}",
    "apps/web/src/app/_platform/runtime/__tests__/api-client-policy.spec.ts":
      "export {}",
  })

  try {
    const result = evaluateNamingConvention(repoRoot, {})
    const messages = result.errors.map((issue) => issue.message).join("\n")

    assert.match(messages, /runtime component filenames must use kebab-case/u)
    assert.match(
      messages,
      /runtime adapter filenames must end with "-adapter\.ts"/u
    )
    assert.match(
      messages,
      /runtime hook filenames must use "use-<subject>\.ts\[x\]"/u
    )
    assert.match(
      messages,
      /runtime policy modules must end with "-policy\.ts"/u
    )
    assert.match(
      messages,
      /Local runtime scripts must start with an approved verb/u
    )
    assert.match(
      messages,
      /runtime service filenames must end with "-service\.ts"/u
    )
    assert.match(messages, /runtime type modules must end with "-types\.ts"/u)
    assert.match(
      messages,
      /runtime unit and integration tests must use "<subject>\.test\.ts\[x\]"/u
    )
  } finally {
    cleanupFixtureRepo(repoRoot)
  }
})

test("governed surfaces reject singular __test__ directories", () => {
  const repoRoot = createFixtureRepo({
    "package.json": JSON.stringify({ name: "fixture", private: true }, null, 2),
    "docs/architecture/governance/NAMING_CONVENTION.md": "# Naming",
    "docs/architecture/adr/ADR_TEMPLATE.md": "# Template",
    "docs/architecture/atc/ATC_TEMPLATE.md": "# Template",
    "packages/vitest-config/src/vitest/defaults.ts":
      "export const vitestDefaults = {}",
    "packages/vitest-config/src/__test__/defaults.test.ts": "export {}",
  })

  try {
    const result = evaluateNamingConvention(repoRoot, {})
    const messages = result.errors.map((issue) => issue.message).join("\n")

    assert.match(messages, /must use "__tests__"/u)
    assert.match(messages, /Singular "__test__" is not allowed/u)
  } finally {
    cleanupFixtureRepo(repoRoot)
  }
})

test("bounded tenant Phase 2 surface passes with valid naming", () => {
  const repoRoot = createFixtureRepo({
    "package.json": JSON.stringify({ name: "fixture", private: true }, null, 2),
    "docs/architecture/governance/NAMING_CONVENTION.md": "# Naming",
    "docs/architecture/adr/ADR_TEMPLATE.md": "# Template",
    "docs/architecture/atc/ATC_TEMPLATE.md": "# Template",
    "apps/web/src/app/_platform/tenant/index.ts":
      "export type { AfendaMeResponse } from './tenant-scope-types'",
    "apps/web/src/app/_platform/tenant/tenant-scope-context.tsx":
      "export function TenantScopeProvider() { return null }",
    "apps/web/src/app/_platform/tenant/tenant-scope-types.ts":
      "export type AfendaMeResponse = {}",
  })

  try {
    const result = evaluateNamingConvention(repoRoot, {})
    assert.equal(result.errors.length, 0)
  } finally {
    cleanupFixtureRepo(repoRoot)
  }
})

test("bounded tenant Phase 2 surface rejects invalid role naming", () => {
  const repoRoot = createFixtureRepo({
    "package.json": JSON.stringify({ name: "fixture", private: true }, null, 2),
    "docs/architecture/governance/NAMING_CONVENTION.md": "# Naming",
    "docs/architecture/adr/ADR_TEMPLATE.md": "# Template",
    "docs/architecture/atc/ATC_TEMPLATE.md": "# Template",
    "apps/web/src/app/_platform/tenant/TenantScopeContext.tsx":
      "export function TenantScopeProvider() { return null }",
    "apps/web/src/app/_platform/tenant/tenant-scope.ts":
      "export type AfendaMeResponse = {}",
  })

  try {
    const result = evaluateNamingConvention(repoRoot, {})
    const messages = result.errors.map((issue) => issue.message).join("\n")

    assert.match(messages, /tenant platform filenames must use kebab-case/u)
    assert.match(
      messages,
      /tenant React context modules must end with "-context\.tsx"/u
    )
    assert.match(
      messages,
      /tenant TypeScript modules must end with "-types\.ts"/u
    )
  } finally {
    cleanupFixtureRepo(repoRoot)
  }
})

test("remaining bounded platform roots pass with valid naming", () => {
  const repoRoot = createFixtureRepo({
    "package.json": JSON.stringify({ name: "fixture", private: true }, null, 2),
    "docs/architecture/governance/NAMING_CONVENTION.md": "# Naming",
    "docs/architecture/adr/ADR_TEMPLATE.md": "# Template",
    "docs/architecture/atc/ATC_TEMPLATE.md": "# Template",
    "apps/web/src/app/_platform/theme/index.ts": "export {}",
    "apps/web/src/app/_platform/theme/app-theme-provider.tsx":
      "export function AppThemeProvider() { return null }",
    "apps/web/src/app/_platform/theme/public-theme-provider.tsx":
      "export function PublicThemeProvider() { return null }",
    "apps/web/src/app/_platform/theme/shell-density-preference.ts":
      "export const density = 'compact'",
    "apps/web/src/app/_platform/theme/shell-motion-root.tsx":
      "export function ShellMotionRoot() { return null }",
    "apps/web/src/app/_platform/theme/theme-color-meta.tsx":
      "export function ThemeColorMeta() { return null }",
    "apps/web/src/app/_platform/theme/theme-inline-path.ts":
      "export const themeInlinePath = ''",
    "apps/web/src/app/_platform/theme/theme-storage-contract.ts":
      "export type ThemeStorage = {}",
    "apps/web/src/app/_platform/theme/use-shell-density.ts":
      "export function useShellDensity() { return 'compact' }",
    "apps/web/src/app/_platform/theme/__tests__/theme-inline-path.test.ts":
      "export {}",
    "apps/web/src/app/_platform/config/index.ts": "export {}",
    "apps/web/src/app/_platform/config/afenda-local-env.ts":
      "export const isEnabled = true",
    "apps/web/src/app/_platform/app-surface/index.ts": "export {}",
    "apps/web/src/app/_platform/app-surface/components/app-surface.tsx":
      "export function AppSurface() { return null }",
    "apps/web/src/app/_platform/app-surface/contract/app-surface-contract.ts":
      "export type AppSurfaceContract = {}",
    "apps/web/src/app/_platform/app-surface/services/validate-app-surface-contract.ts":
      "export function validateAppSurfaceContract() { return true }",
    "apps/web/src/app/_platform/app-surface/__tests__/app-surface.test.tsx":
      "export {}",
    "apps/web/src/app/_platform/auth/index.ts": "export {}",
    "apps/web/src/app/_platform/auth/auth-client.ts":
      "export const authClient = {}",
    "apps/web/src/app/_platform/auth/auth.css": ".auth {}",
    "apps/web/src/app/_platform/auth/better-auth-ui/afenda-auth-link.tsx":
      "export function AfendaAuthLink() { return null }",
    "apps/web/src/app/_platform/auth/better-auth-ui/afenda-auth-ui-provider.tsx":
      "export function AfendaAuthUiProvider() { return null }",
    "apps/web/src/app/_platform/auth/better-auth-ui/use-afenda-auth-ui-config.ts":
      "export function useAfendaAuthUiConfig() { return null }",
    "apps/web/src/app/_platform/auth/contracts/auth-domain.ts":
      "export type AuthDomain = {}",
    "apps/web/src/app/_platform/auth/guards/require-auth.tsx":
      "export function RequireAuth() { return null }",
    "apps/web/src/app/_platform/auth/hooks/use-auth-sessions.ts":
      "export function useAuthSessions() { return null }",
    "apps/web/src/app/_platform/auth/mappers/map-auth-error-to-user-message.ts":
      "export function mapAuthErrorToUserMessage() { return '' }",
    "apps/web/src/app/_platform/auth/mappers/__tests__/map-auth-error-to-user-message.test.ts":
      "export {}",
    "apps/web/src/app/_platform/auth/routes/auth-layout.tsx":
      "export function AuthLayout() { return null }",
    "apps/web/src/app/_platform/auth/routes/route-auth.tsx":
      "export function RouteAuth() { return null }",
    "apps/web/src/app/_platform/auth/routes/__tests__/route-auth.test.tsx":
      "export {}",
    "apps/web/src/app/_platform/auth/services/auth-session-service.ts":
      "export function createSessionService() { return null }",
    "apps/web/src/app/_platform/auth/__tests__/auth-layout.test.tsx":
      "export {}",
    "apps/web/src/app/_platform/shell/index.ts": "export {}",
    "apps/web/src/app/_platform/shell/shell-command-surface.ts":
      "export type ShellCommandSurface = {}",
    "apps/web/src/app/_platform/shell/components/app-shell-route-state.tsx":
      "export function AppShellRouteState() { return null }",
    "apps/web/src/app/_platform/shell/components/shell-left-sidebar-block/index.ts":
      "export {}",
    "apps/web/src/app/_platform/shell/components/shell-left-sidebar-block/shell-left-sidebar-panel.tsx":
      "export function ShellLabelsColumn() { return null }",
    "apps/web/src/app/_platform/shell/components/shell-left-sidebar-block/shell-left-sidebar-search.tsx":
      "export function ShellLabelsColumnSearch() { return null }",
    "apps/web/src/app/_platform/shell/components/shell-left-sidebar-block/use-shell-left-sidebar-display-mode.ts":
      "export function useShellLeftSidebarDisplayMode() { return null }",
    "apps/web/src/app/_platform/shell/components/__tests__/app-shell-route-state.test.tsx":
      "export {}",
    "apps/web/src/app/_platform/shell/constants/shell-icon-names.ts":
      "export const shellIconNames = []",
    "apps/web/src/app/_platform/shell/contract/shell-command-contract.ts":
      "export type ShellCommandContract = {}",
    "apps/web/src/app/_platform/shell/errors/shell-command-error.ts":
      "export class ShellCommandError extends Error {}",
    "apps/web/src/app/_platform/shell/hooks/use-shell-navigation.ts":
      "export function useShellNavigation() { return null }",
    "apps/web/src/app/_platform/shell/policy/shell-policy.ts":
      "export const shellPolicy = {}",
    "apps/web/src/app/_platform/shell/registry/shell-command-registry.ts":
      "export const shellCommandRegistry = new Map()",
    "apps/web/src/app/_platform/shell/routes/shell-route-definitions.ts":
      "export const shellRouteDefinitions = []",
    "apps/web/src/app/_platform/shell/scripts/inspect-shell-validation-report-diff.ts":
      "export function inspectShellValidationReportDiff() { return null }",
    "apps/web/src/app/_platform/shell/services/resolve-shell-title.ts":
      "export function resolveShellTitle() { return '' }",
    "apps/web/src/app/_platform/shell/store/shell-command-activity-store.ts":
      "export const shellCommandActivityStore = {}",
    "apps/web/src/app/_platform/shell/types/shell-i18n-keys.ts":
      "export type ShellI18nKeys = string",
    "apps/web/src/app/_platform/shell/__tests__/shell-command-errors.test.ts":
      "export {}",
  })

  try {
    const result = evaluateNamingConvention(repoRoot, {})
    assert.equal(result.errors.length, 0)
  } finally {
    cleanupFixtureRepo(repoRoot)
  }
})

test("remaining bounded platform roots reject invalid role naming", () => {
  const repoRoot = createFixtureRepo({
    "package.json": JSON.stringify({ name: "fixture", private: true }, null, 2),
    "docs/architecture/governance/NAMING_CONVENTION.md": "# Naming",
    "docs/architecture/adr/ADR_TEMPLATE.md": "# Template",
    "docs/architecture/atc/ATC_TEMPLATE.md": "# Template",
    "apps/web/src/app/_platform/theme/Theme.tsx":
      "export function Theme() { return null }",
    "apps/web/src/app/_platform/config/config.ts": "export const config = {}",
    "apps/web/src/app/_platform/app-surface/services/app-surface.ts":
      "export const appSurface = {}",
    "apps/web/src/app/_platform/auth/guards/auth.tsx":
      "export function AuthGuard() { return null }",
    "apps/web/src/app/_platform/auth/hooks/auth.ts":
      "export function useAuth() { return null }",
    "apps/web/src/app/_platform/auth/mappers/auth.ts":
      "export function mapAuth() { return null }",
    "apps/web/src/app/_platform/auth/routes/auth.tsx":
      "export function AuthRoute() { return null }",
    "apps/web/src/app/_platform/auth/services/auth.ts":
      "export const auth = {}",
    "apps/web/src/app/_platform/shell/components/shell-left-sidebar-block/panel.tsx":
      "export function ShellLabelsColumn() { return null }",
    "apps/web/src/app/_platform/shell/errors/shell-command.ts":
      "export class ShellCommandError extends Error {}",
    "apps/web/src/app/_platform/shell/hooks/shell-navigation.ts":
      "export function useShellNavigation() { return null }",
    "apps/web/src/app/_platform/shell/policy/policy.ts":
      "export const shellPolicy = {}",
    "apps/web/src/app/_platform/shell/registry/registry.ts":
      "export const registry = new Map()",
    "apps/web/src/app/_platform/shell/scripts/shell.ts":
      "export const shell = {}",
    "apps/web/src/app/_platform/shell/store/shell.ts":
      "export const shell = {}",
    "apps/web/src/app/_platform/shell/__tests__/shell.spec.ts": "export {}",
  })

  try {
    const result = evaluateNamingConvention(repoRoot, {})
    const messages = result.errors.map((issue) => issue.message).join("\n")

    assert.match(messages, /theme React modules must end with/u)
    assert.match(messages, /config modules must end with "-env\.ts"/u)
    assert.match(
      messages,
      /app-surface service modules must use approved verb-first naming/u
    )
    assert.match(
      messages,
      /auth guard modules must use "require-<subject>\.tsx"/u
    )
    assert.match(
      messages,
      /auth hook modules must use "use-<subject>\.ts\[x\]"/u
    )
    assert.match(messages, /auth mapper modules must use "map-<subject>\.ts"/u)
    assert.match(
      messages,
      /auth route modules must use "route-<subject>\.tsx"/u
    )
    assert.match(messages, /auth service modules must end with "-service\.ts"/u)
    assert.match(messages, /Generic or catch-all filenames are not allowed/u)
    assert.match(messages, /shell error modules must end with "-error\.ts"/u)
    assert.match(
      messages,
      /shell hook modules must use "use-<subject>\.ts\[x\]"/u
    )
    assert.match(messages, /shell policy modules must end with "-policy\.ts"/u)
    assert.match(
      messages,
      /shell registry modules must end with "-registry\.ts" or "-instance\.ts"/u
    )
    assert.match(
      messages,
      /Local shell scripts must start with an approved verb/u
    )
    assert.match(
      messages,
      /shell store modules must end with "-store\.ts" or "-instance\.ts"/u
    )
    assert.match(
      messages,
      /shell unit and integration tests must use "<subject>\.test\.ts\[x\]"/u
    )
  } finally {
    cleanupFixtureRepo(repoRoot)
  }
})

test("app components and features pass with valid naming", () => {
  const repoRoot = createFixtureRepo({
    "package.json": JSON.stringify({ name: "fixture", private: true }, null, 2),
    "docs/architecture/governance/NAMING_CONVENTION.md": "# Naming",
    "docs/architecture/adr/ADR_TEMPLATE.md": "# Template",
    "docs/architecture/atc/ATC_TEMPLATE.md": "# Template",
    "apps/web/src/app/_components/index.ts": "export {}",
    "apps/web/src/app/_components/app-states/index.ts": "export {}",
    "apps/web/src/app/_components/app-states/app-bootstrap-loading.tsx":
      "export function AppBootstrapLoading() { return null }",
    "apps/web/src/app/_components/app-states/root-error-boundary.tsx":
      "export function RootErrorBoundary() { return null }",
    "apps/web/src/app/_components/app-states/__tests__/root-error-boundary.test.tsx":
      "export {}",
    "apps/web/src/app/_features/feature-a/index.ts": "export {}",
    "apps/web/src/app/_features/feature-a/feature-a-page.tsx":
      "export function FeatureAPage() { return null }",
    "apps/web/src/app/_features/feature-a/feature-a-view.test.tsx": "export {}",
    "apps/web/src/app/_features/feature-a/components/feature-a-panel.tsx":
      "export function FeatureAPanel() { return null }",
    "apps/web/src/app/_features/feature-a/components/__tests__/feature-a-panel.test.tsx":
      "export {}",
    "apps/web/src/app/_features/feature-a/hooks/use-feature-a.ts":
      "export function useFeatureA() { return null }",
    "apps/web/src/app/_features/feature-a/services/feature-a.api.ts":
      "export const featureA = {}",
    "apps/web/src/app/_features/feature-a/types/feature-a.ts":
      "export type FeatureA = {}",
    "apps/web/src/app/_features/feature-a/scripts/generate-feature-a-report.ts":
      "export function generateFeatureAReport() { return null }",
  })

  try {
    const result = evaluateNamingConvention(repoRoot, {})
    assert.equal(result.errors.length, 0)
  } finally {
    cleanupFixtureRepo(repoRoot)
  }
})

test("app components and features reject invalid naming", () => {
  const repoRoot = createFixtureRepo({
    "package.json": JSON.stringify({ name: "fixture", private: true }, null, 2),
    "docs/architecture/governance/NAMING_CONVENTION.md": "# Naming",
    "docs/architecture/adr/ADR_TEMPLATE.md": "# Template",
    "docs/architecture/atc/ATC_TEMPLATE.md": "# Template",
    "apps/web/src/app/_components/app-states/Component.tsx":
      "export function Component() { return null }",
    "apps/web/src/app/_components/app-states/__tests__/state.spec.tsx":
      "export {}",
    "apps/web/src/app/_features/feature-a/components/FeatureThing.tsx":
      "export function FeatureThing() { return null }",
    "apps/web/src/app/_features/feature-a/hooks/feature-a.ts":
      "export function useFeatureA() { return null }",
    "apps/web/src/app/_features/feature-a/scripts/feature-a.ts":
      "export const featureA = {}",
    "apps/web/src/app/_features/feature-a/__tests__/feature-a.spec.ts":
      "export {}",
  })

  try {
    const result = evaluateNamingConvention(repoRoot, {})
    const messages = result.errors.map((issue) => issue.message).join("\n")

    assert.match(
      messages,
      /app component filenames must use lower-case kebab naming/u
    )
    assert.match(
      messages,
      /app component unit and integration tests must use "<subject>\.test\.ts\[x\]"/u
    )
    assert.match(messages, /feature component filenames must use kebab-case/u)
    assert.match(
      messages,
      /feature hook modules must use "use-<subject>\.ts\[x\]"/u
    )
    assert.match(
      messages,
      /Local feature scripts must start with an approved verb/u
    )
    assert.match(
      messages,
      /feature unit and integration tests must use "<subject>\.test\.ts\[x\]"/u
    )
  } finally {
    cleanupFixtureRepo(repoRoot)
  }
})

test("remaining app and package roots pass with valid naming", () => {
  const repoRoot = createFixtureRepo({
    "package.json": JSON.stringify({ name: "fixture", private: true }, null, 2),
    "docs/architecture/governance/NAMING_CONVENTION.md": "# Naming",
    "docs/architecture/adr/ADR_TEMPLATE.md": "# Template",
    "docs/architecture/atc/ATC_TEMPLATE.md": "# Template",
    "apps/web/src/routes/index.ts": "export {}",
    "apps/web/src/routes/README.md": "# routes",
    "apps/web/src/routes/route-app-shell.tsx":
      "export function RouteAppShell() { return null }",
    "apps/web/src/routes/__tests__/route-marketing-parity.test.ts": "export {}",
    "apps/web/src/share/components/auth/auth.tsx":
      "export function Auth() { return null }",
    "apps/web/src/share/components/auth/__tests__/sign-up.test.tsx":
      "export {}",
    "apps/web/src/rpc/index.ts": "export {}",
    "apps/web/src/rpc/web-client.ts": "export const webClient = {}",
    "apps/web/src/rpc/web-envelope.contract.ts":
      "export const webErrorEnvelopeSchema = {}",
    "apps/web/src/marketing/README.md": "# marketing",
    "apps/web/src/marketing/marketing-layout.tsx":
      "export function MarketingLayout() { return null }",
    "apps/web/src/marketing/marketing-page-registry.ts":
      "export const marketingLandingVariants = []",
    "apps/web/src/marketing/marketing-routes.tsx":
      "export const marketingRouteObjects = []",
    "apps/web/src/marketing/marketing-theme-provider.tsx":
      "export function MarketingThemeProvider() { return null }",
    "apps/web/src/marketing/marketing-loading-fallback.tsx":
      "export function MarketingLoadingFallback() { return null }",
    "apps/web/src/marketing/marketing.config.ts":
      "export const MARKETING_CONFIG = {}",
    "apps/web/src/marketing/marketing.css": ".marketing {}",
    "apps/web/src/marketing/components/index.ts": "export {}",
    "apps/web/src/marketing/components/marketing-page-shell.tsx":
      "export function MarketingPageShell() { return null }",
    "apps/web/src/marketing/pages/company/about/about-page.tsx":
      "export default function AboutPage() { return null }",
    "apps/web/src/marketing/pages/company/about/about-page-editorial.ts":
      "export const aboutPageContent = {}",
    "apps/web/src/marketing/pages/company/about/about-page-hero.tsx":
      "export function AboutHero() { return null }",
    "apps/web/src/marketing/pages/company/about/about-page-footer-cta.tsx":
      "export function AboutFooterCta() { return null }",
    "apps/web/src/marketing/pages/company/about/about-page-section-credibility.tsx":
      "export function AboutSection05Credibility() { return null }",
    "apps/web/src/marketing/pages/legal/data-governance/governance-data-page.tsx":
      "export default function GovernanceDataPage() { return null }",
    "apps/web/src/marketing/pages/legal/data-governance/governance-data-page-editorial.ts":
      "export const dataGovernanceEditorial = {}",
    "apps/web/src/marketing/pages/landing/moire-landing-page.tsx":
      "export default function MoireLandingPage() { return null }",
    "apps/web/src/marketing/pages/landing/flagship/flagship-page.tsx":
      "export default function FlagshipPage() { return null }",
    "apps/web/src/marketing/__tests__/marketing.config.test.ts": "export {}",
    "packages/contracts/src/index.ts": "export {}",
    "packages/env-loader/src/index.ts": "export {}",
    "packages/pino-logger/src/index.ts": "export {}",
    "packages/pino-logger/src/hono-request-logging.ts":
      "export const honoRequestLogging = {}",
    "packages/pino-logger/src/__tests__/hono-request-logging.test.ts":
      "export {}",
    "packages/better-auth/src/index.ts": "export {}",
    "packages/better-auth/src/schema/index.ts": "export {}",
    "packages/better-auth/src/schema/auth-schema.generated.ts":
      "export const authSchema = {}",
    "packages/better-auth/src/__tests__/build-afenda-auth-plugins.test.ts":
      "export {}",
    "packages/better-auth/scripts/run-auth-migrate-with-plugins.mjs":
      "export {}",
    "packages/vitest-config/src/vitest/defaults.ts":
      "export const vitestDefaults = {}",
    "packages/vitest-config/src/__tests__/defaults.test.ts": "export {}",
    "packages/vitest-config/dist/vitest/defaults.js":
      "export const vitestDefaults = {}",
    "packages/vitest-config/dist/vitest/defaults.d.ts":
      "export type VitestDefaults = {}",
    "packages/vitest-config/dist/vitest/defaults.d.ts.map": "{}",
    "packages/eslint-config/src/index.js": "export default []",
    "packages/eslint-config/src/plugin.js": "export default {}",
    "packages/eslint-config/src/rules/no-inline-styles.js": "export default {}",
    "packages/eslint-config/src/rules/__tests__/no-inline-styles.test.js":
      "export {}",
    "packages/design-system/hooks/index.ts": "export {}",
    "packages/design-system/hooks/use-copy-to-clipboard.ts":
      "export function useCopyToClipboard() { return null }",
    "packages/design-system/icons/index.ts": "export {}",
    "packages/design-system/icons/icon-policy.ts":
      "export const iconPolicy = {}",
    "packages/design-system/icons/create-icon-loader.tsx":
      "export function createIconLoader() { return null }",
    "packages/design-system/icons/__lucide__.ts": "export const lucide = {}",
    "packages/design-system/icons/script/build-icons.ts": "export {}",
    "packages/design-system/icons/__tests__/icons-barrel.test.ts": "export {}",
    "packages/design-system/ui-primitives/index.ts": "export {}",
    "packages/design-system/ui-primitives/button.tsx":
      "export function Button() { return null }",
    "packages/design-system/ui-primitives/button.manifest.ts":
      "export const buttonManifest = {}",
    "packages/design-system/ui-primitives/__tests__/button.test.ts":
      "export {}",
    "packages/design-system/utils/index.ts": "export {}",
    "packages/design-system/utils/cn.ts": "export function cn() { return '' }",
    "packages/design-system/utils/__tests__/cn.test.ts": "export {}",
    "packages/design-system/generated/component-coverage.json": "{}",
    "packages/design-system/generated/schemas/component-coverage.schema.json":
      "{}",
    "packages/design-system/scripts/check-tailwind-tokens.ts": "export {}",
    "packages/design-system/scripts/component-governance/check.ts": "export {}",
    "packages/design-system/scripts/component-governance/__tests__/extractor.test.ts":
      "export {}",
    "packages/design-system/design-architecture/src/local.css": "body{}",
    "packages/design-system/design-architecture/__tests__/theme-contract-drift.test.ts":
      "export {}",
    "packages/_database/scripts/verify-hardening-patch-order.ts":
      "export const HARDENING_PATCH_FILENAMES = []",
    "packages/_database/sql/hardening/patch_a_triggers.sql": "-- sql",
    "packages/_database/drizzle/0000_dear_rockslide.sql": "-- sql",
    "packages/_database/drizzle/meta/_journal.json": "{}",
    "packages/_database/drizzle/meta/0000_snapshot.json": "{}",
    "packages/_database/src/index.ts": "export {}",
    "packages/_database/src/schema/governance/governance-data-sources.schema.ts":
      "export const dataSources = {}",
    "packages/_database/src/views/__tests__/drizzle-view-testing-utils.ts":
      "export const drizzleViewTestingUtils = {}",
    "packages/_database/src/__tests__/hardening-patches.test.ts": "export {}",
  })

  try {
    const result = evaluateNamingConvention(repoRoot, {})
    assert.equal(result.errors.length, 0)
  } finally {
    cleanupFixtureRepo(repoRoot)
  }
})

test("remaining app and package roots reject invalid naming", () => {
  const repoRoot = createFixtureRepo({
    "package.json": JSON.stringify({ name: "fixture", private: true }, null, 2),
    "docs/architecture/governance/NAMING_CONVENTION.md": "# Naming",
    "docs/architecture/adr/ADR_TEMPLATE.md": "# Template",
    "docs/architecture/atc/ATC_TEMPLATE.md": "# Template",
    "apps/web/src/routes/shell.tsx": "export function Shell() { return null }",
    "apps/web/src/rpc/client.ts": "export const client = {}",
    "apps/web/src/marketing/pages/landing/1.Moire-BW.tsx":
      "export default function BadLanding() { return null }",
    "apps/web/src/marketing/pages/company/about/page.tsx":
      "export default function AboutPage() { return null }",
    "packages/better-auth/src/schema/AuthSchema.generated.ts":
      "export const authSchema = {}",
    "packages/vitest-config/dist/vitest/BadName.js":
      "export const badName = {}",
    "packages/eslint-config/src/rules/BadRule.js": "export default {}",
    "packages/design-system/generated/ComponentCoverage.json": "{}",
    "packages/_database/scripts/hardening-patch-order.ts":
      "export const HARDENING_PATCH_FILENAMES = []",
    "packages/_database/sql/hardening/patch-triggers.sql": "-- sql",
    "packages/_database/src/views/__tests__/helper.ts":
      "export const helper = {}",
  })

  try {
    const result = evaluateNamingConvention(repoRoot, {})
    const messages = result.errors.map((issue) => issue.message).join("\n")

    assert.match(messages, /route modules must use "route-<subject>\.tsx"/u)
    assert.match(
      messages,
      /rpc modules must use "web-<subject>\.ts" or "web-<subject>\.contract\.ts"/u
    )
    assert.match(messages, /marketing landing variants must use descriptive/u)
    assert.match(messages, /about page modules must use explicit about-page/u)
    assert.match(messages, /better-auth generated modules must use/u)
    assert.match(messages, /vitest-config dist artifacts must use kebab-case/u)
    assert.match(messages, /eslint rule filenames must use kebab-case/u)
    assert.match(
      messages,
      /design-system generated JSON files must use kebab-case/u
    )
    assert.match(
      messages,
      /Package-local database scripts must use an approved verb-first naming pattern/u
    )
    assert.match(
      messages,
      /database hardening patches must use patch_<letter>_<subject>\.sql naming/u
    )
    assert.match(messages, /database package tests must use/u)
  } finally {
    cleanupFixtureRepo(repoRoot)
  }
})

function createFixtureRepo(files: Record<string, string>): string {
  const repoRoot = mkdtempSync(path.join(os.tmpdir(), "naming-convention-"))

  for (const [relativePath, content] of Object.entries(files)) {
    const absolutePath = path.join(repoRoot, relativePath)
    mkdirSync(path.dirname(absolutePath), { recursive: true })
    writeFileSync(absolutePath, `${content}\n`, "utf8")
  }

  return repoRoot
}

function cleanupFixtureRepo(repoRoot: string) {
  rmSync(repoRoot, { recursive: true, force: true })
}
