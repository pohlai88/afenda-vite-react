/**
 * Run Vitest via the programmatic Node API (`startVitest` from `vitest/node`) and
 * print a structured summary for CI / local diagnosis (per-module pass/fail).
 *
 * @see https://vitest.dev/guide/advanced/api
 *
 * Usage (from repo root):
 *   pnpm run script:inspect-vitest-diagnostics
 *   pnpm run script:inspect-vitest-diagnostics -- design-system
 *   pnpm run script:inspect-vitest-diagnostics -- web src/share/__test__/shell-registry.test.ts
 *   pnpm run script:inspect-vitest-diagnostics -- --all --json
 */
import path from "node:path"
import { fileURLToPath } from "node:url"

import { startVitest } from "vitest/node"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.join(__dirname, "..")

type TargetKey = "design-system" | "vitest-config" | "web"

const TARGETS: Record<
  TargetKey,
  { readonly relativeDir: string; readonly configFile: string }
> = {
  "design-system": {
    relativeDir: "packages/design-system",
    configFile: "vitest.config.ts",
  },
  "vitest-config": {
    relativeDir: "packages/vitest-config",
    configFile: "vitest.config.ts",
  },
  web: {
    relativeDir: "apps/web",
    configFile: "vite.config.ts",
  },
}

type ModuleDiag = { readonly moduleId: string; readonly ok: boolean }

type RunDiag = {
  readonly target: TargetKey
  readonly packageRoot: string
  readonly configFile: string
  readonly cliFilters: readonly string[]
  readonly testFiles: number
  readonly failedFiles: number
  readonly modules: readonly ModuleDiag[]
}

function isTargetKey(s: string): s is TargetKey {
  return Object.prototype.hasOwnProperty.call(TARGETS, s)
}

/** Heuristic: Vitest CLI file/path filter rather than a package key. */
function looksLikeCliFilter(s: string): boolean {
  return (
    s.includes("/") ||
    s.includes("\\") ||
    /\.(test|spec)\.[cm]?[jt]sx?$/.test(s) ||
    s.includes("*") ||
    s.startsWith("src/")
  )
}

function parseArgs(argv: readonly string[]): {
  readonly json: boolean
  readonly all: boolean
  readonly target: TargetKey | null
  readonly filters: readonly string[]
} {
  const flags = new Set<string>()
  const positional: string[] = []
  for (const a of argv) {
    if (a === "--json") flags.add("json")
    else if (a === "--all") flags.add("all")
    else if (a.startsWith("-")) {
      console.warn(`Unknown flag "${a}" ignored.`)
    } else {
      positional.push(a)
    }
  }
  const all = flags.has("all")
  const json = flags.has("json")
  const first = positional[0]
  let target: TargetKey | null = null
  let filters: readonly string[] = []

  if (first !== undefined && isTargetKey(first)) {
    target = first
    filters = positional.slice(1)
  } else if (first !== undefined && looksLikeCliFilter(first)) {
    filters = positional
  } else if (first !== undefined) {
    console.warn(
      `First argument "${first}" is not a known package key (${Object.keys(TARGETS).join(", ")}); treating as Vitest CLI filter.`
    )
    filters = positional
  }

  return { json, all, target, filters }
}

async function diagnoseOne(
  key: TargetKey,
  cliFilters: readonly string[]
): Promise<RunDiag> {
  const meta = TARGETS[key]
  const packageRoot = path.join(repoRoot, meta.relativeDir)
  const previousCwd = process.cwd()
  process.chdir(packageRoot)
  try {
    const vitest = await startVitest(
      "test",
      [...cliFilters],
      { watch: false },
      // `configFile` is resolved by Vitest when bootstrapping Vite; Vite’s `UserConfig`
      // typings may not list it in some versions.
      { configFile: meta.configFile } as Record<string, unknown> as Parameters<
        typeof startVitest
      >[3]
    )
    const raw = vitest.state.getTestModules()
    const modules: ModuleDiag[] = raw.map((m) => ({
      moduleId: m.moduleId,
      ok: m.ok(),
    }))
    const failedFiles = modules.filter((m) => !m.ok).length
    await vitest.close()
    return {
      target: key,
      packageRoot,
      configFile: meta.configFile,
      cliFilters,
      testFiles: modules.length,
      failedFiles,
      modules,
    }
  } finally {
    process.chdir(previousCwd)
  }
}

async function main(): Promise<void> {
  const { json, all, target, filters } = parseArgs(process.argv.slice(2))
  const keys: TargetKey[] = all
    ? (Object.keys(TARGETS) as TargetKey[])
    : [target ?? "design-system"]

  const results: RunDiag[] = []
  for (const k of keys) {
    if (!(k in TARGETS)) {
      throw new Error(
        `Unknown target "${k}". Use: ${Object.keys(TARGETS).join(", ")}`
      )
    }
    results.push(await diagnoseOne(k, filters))
  }

  let exitCode = 0
  for (const r of results) {
    if (r.failedFiles > 0) exitCode = 1
  }

  if (json) {
    console.log(JSON.stringify({ results }, null, 2))
  } else {
    for (const r of results) {
      console.log("")
      console.log(`— Vitest diagnostics: ${r.target}`)
      console.log(`  root:   ${r.packageRoot}`)
      console.log(`  config: ${r.configFile}`)
      console.log(
        `  filters: ${r.cliFilters.length ? r.cliFilters.join(" ") : "(none)"}`
      )
      console.log(`  files: ${r.testFiles}  failed files: ${r.failedFiles}`)
      if (r.failedFiles > 0) {
        for (const m of r.modules) {
          if (!m.ok) console.log(`    ✗ ${m.moduleId}`)
        }
      }
    }
    console.log("")
  }

  process.exitCode = exitCode
}

main().catch((err: unknown) => {
  console.error(err)
  process.exitCode = 1
})
