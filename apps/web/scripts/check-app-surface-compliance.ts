/**
 * owner: apps/web
 * scope: app-local
 * domain: app-surface
 *
 * Fails if the first adopted authenticated operating surfaces drift away from
 * the canonical AppSurface / StateSurface contract.
 *
 * Run from apps/web: `pnpm run app-surface:check`
 */
import { readFileSync } from "node:fs"
import { join } from "node:path"

const appRoot = join(import.meta.dirname, "..")
const targetFile = join(
  appRoot,
  "src",
  "app",
  "_features",
  "events-workspace",
  "components",
  "events-workspace-pages.tsx"
)
const settingsTargetFile = join(
  appRoot,
  "src",
  "app",
  "_features",
  "better-auth-settings",
  "better-auth-settings-view.tsx"
)
const dbStudioTargetFile = join(
  appRoot,
  "src",
  "app",
  "_features",
  "db-studio",
  "components",
  "db-studio-page.tsx"
)
const shellNotFoundTargetFile = join(
  appRoot,
  "src",
  "app",
  "_platform",
  "shell",
  "components",
  "app-shell-not-found.tsx"
)
const shellAccessDeniedTargetFile = join(
  appRoot,
  "src",
  "app",
  "_platform",
  "shell",
  "components",
  "app-shell-access-denied.tsx"
)
const shellRouteStateTargetFile = join(
  appRoot,
  "src",
  "app",
  "_platform",
  "shell",
  "components",
  "app-shell-route-state.tsx"
)

const text = readFileSync(targetFile, "utf8")
const settingsText = readFileSync(settingsTargetFile, "utf8")
const dbStudioText = readFileSync(dbStudioTargetFile, "utf8")
const shellNotFoundText = readFileSync(shellNotFoundTargetFile, "utf8")
const shellAccessDeniedText = readFileSync(shellAccessDeniedTargetFile, "utf8")
const shellRouteStateText = readFileSync(shellRouteStateTargetFile, "utf8")

const requiredPatterns = [
  {
    label: "AppSurface adoption",
    test: /<AppSurface\s+contract=\{surfaceContract\}/,
  },
  {
    label: "StateSurface adoption",
    test: /\bStateSurface\b/,
  },
  {
    label: "workspace surface contract",
    test: /\bcreateWorkspaceSurfaceContract\b/,
  },
  {
    label: "truth surface contract",
    test: /\bcreateTruthSurfaceContract\b/,
  },
] as const

const forbiddenPatterns = [
  {
    label: "route-owned page shell",
    test: /\bPageShell\b/,
  },
  {
    label: "route-owned audit shell",
    test: /\bAuditPageShell\b/,
  },
  {
    label: "route-owned workspace error state",
    test: /\bWorkspaceErrorState\b/,
  },
  {
    label: "route-owned empty workspace state",
    test: /\bEmptyWorkspaceState\b/,
  },
  {
    label: "legacy app loading state usage",
    test: /\bAppLoadingState\b/,
  },
  {
    label: "legacy app error state usage",
    test: /\bAppErrorState\b/,
  },
  {
    label: "legacy app empty state usage",
    test: /\bAppEmptyState\b/,
  },
] as const

const missing = requiredPatterns
  .filter((entry) => !entry.test.test(text))
  .map((entry) => entry.label)

const forbidden = forbiddenPatterns
  .filter((entry) => entry.test.test(text))
  .map((entry) => entry.label)

if (missing.length > 0 || forbidden.length > 0) {
  const lines = ["app surface compliance: FAILED"]

  if (missing.length > 0) {
    lines.push("", "Missing required markers:")
    lines.push(...missing.map((entry) => `- ${entry}`))
  }

  if (forbidden.length > 0) {
    lines.push("", "Forbidden drift detected:")
    lines.push(...forbidden.map((entry) => `- ${entry}`))
  }

  console.error(lines.join("\n"))
  process.exit(1)
}

const settingsRequiredPatterns = [
  {
    label: "settings AppSurface adoption",
    test: /<AppSurface\s+contract=\{contract\}/,
  },
  {
    label: "settings embedded view",
    test: /<Settings[\s\S]*embedded/,
  },
  {
    label: "settings state surface adoption",
    test: /\bStateSurface\b/,
  },
] as const

const settingsForbiddenPatterns = [
  {
    label: "settings standalone route-owned section shell",
    test: /<section className="ui-page/,
  },
] as const

const settingsMissing = settingsRequiredPatterns
  .filter((entry) => !entry.test.test(settingsText))
  .map((entry) => entry.label)

const settingsForbidden = settingsForbiddenPatterns
  .filter((entry) => entry.test.test(settingsText))
  .map((entry) => entry.label)

if (settingsMissing.length > 0 || settingsForbidden.length > 0) {
  const lines = ["app surface compliance: FAILED (settings slice)"]

  if (settingsMissing.length > 0) {
    lines.push("", "Missing required markers:")
    lines.push(...settingsMissing.map((entry) => `- ${entry}`))
  }

  if (settingsForbidden.length > 0) {
    lines.push("", "Forbidden drift detected:")
    lines.push(...settingsForbidden.map((entry) => `- ${entry}`))
  }

  console.error(lines.join("\n"))
  process.exit(1)
}

const dbStudioRequiredPatterns = [
  {
    label: "db-studio AppSurface adoption",
    test: /<AppSurface\s+contract=\{surfaceContract\}/,
  },
  {
    label: "db-studio StateSurface adoption",
    test: /\bStateSurface\b/,
  },
] as const

const dbStudioMissing = dbStudioRequiredPatterns
  .filter((entry) => !entry.test.test(dbStudioText))
  .map((entry) => entry.label)

if (dbStudioMissing.length > 0) {
  const lines = ["app surface compliance: FAILED (db-studio slice)"]

  lines.push("", "Missing required markers:")
  lines.push(...dbStudioMissing.map((entry) => `- ${entry}`))

  console.error(lines.join("\n"))
  process.exit(1)
}

const shellStateHelperRequiredPatterns = [
  {
    label: "shell AppSurface adoption",
    test: /\bAppSurface\b/,
  },
  {
    label: "shell StateSurface adoption",
    test: /\bStateSurface\b/,
  },
] as const

const shellStateHelperForbiddenPatterns = [
  {
    label: "shell route-local ui-page wrapper",
    test: /className="ui-page/,
  },
] as const

const shellStateDelegationPatterns = [
  {
    label: "shell route state delegation",
    test: /\bAppShellRouteState\b/,
  },
] as const

const shellStateHelperMissing = shellStateHelperRequiredPatterns
  .filter((entry) => !entry.test.test(shellRouteStateText))
  .map((entry) => entry.label)
const shellStateHelperForbidden = shellStateHelperForbiddenPatterns
  .filter((entry) => entry.test.test(shellRouteStateText))
  .map((entry) => entry.label)

if (
  shellStateHelperMissing.length > 0 ||
  shellStateHelperForbidden.length > 0
) {
  const lines = ["app surface compliance: FAILED (shell route-state helper)"]

  if (shellStateHelperMissing.length > 0) {
    lines.push("", "Missing required markers:")
    lines.push(...shellStateHelperMissing.map((entry) => `- ${entry}`))
  }

  if (shellStateHelperForbidden.length > 0) {
    lines.push("", "Forbidden drift detected:")
    lines.push(...shellStateHelperForbidden.map((entry) => `- ${entry}`))
  }

  console.error(lines.join("\n"))
  process.exit(1)
}

for (const [sliceName, content] of [
  ["shell not-found slice", shellNotFoundText],
  ["shell access-denied slice", shellAccessDeniedText],
] as const) {
  const shellMissing = shellStateDelegationPatterns
    .filter((entry) => !entry.test.test(content))
    .map((entry) => entry.label)
  const shellForbidden = shellStateHelperForbiddenPatterns
    .filter((entry) => entry.test.test(content))
    .map((entry) => entry.label)

  if (shellMissing.length > 0 || shellForbidden.length > 0) {
    const lines = [`app surface compliance: FAILED (${sliceName})`]

    if (shellMissing.length > 0) {
      lines.push("", "Missing required markers:")
      lines.push(...shellMissing.map((entry) => `- ${entry}`))
    }

    if (shellForbidden.length > 0) {
      lines.push("", "Forbidden drift detected:")
      lines.push(...shellForbidden.map((entry) => `- ${entry}`))
    }

    console.error(lines.join("\n"))
    process.exit(1)
  }
}

console.info("app surface compliance: OK")
