import { existsSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

/** Augments `vite` `UserConfig` with `test` (Vitest). */
import "vitest/config"
import type { UserConfig } from "vite"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** Resolved path to the shared jest-dom setup (for `setupFiles` overrides or tooling). */
export const afendaVitestSetupFile = existsSync(
  path.join(__dirname, "setup.js")
)
  ? path.join(__dirname, "setup.js")
  : path.join(__dirname, "setup.ts")

export type VitestEnvironment = "jsdom" | "node" | "happy-dom" | "edge-runtime"

export interface AfendaVitestOptions {
  /** Test environment. Default `jsdom` for UI-style apps. */
  environment?: VitestEnvironment
  /**
   * Extra setup files after the shared Afenda setup (jest-dom), when using the default jsdom path.
   * Pass `[]` to skip all setup, including jest-dom.
   */
  setupFiles?: string[]
}

type ThresholdPreset = {
  lines: number
  statements: number
  functions: number
  branches: number
}

/** Default vs strict coverage floors (see packages/vitest-config/TESTING.md). */
export const COVERAGE_PRESETS: {
  default: ThresholdPreset
  strict: ThresholdPreset
} = {
  default: {
    lines: 5,
    statements: 5,
    functions: 5,
    branches: 3,
  },
  strict: {
    lines: 80,
    statements: 80,
    functions: 70,
    branches: 50,
  },
}

const VALID_POOLS = new Set(["forks", "threads", "vmThreads"])

function parseEnvNumber(name: string): number | undefined {
  const raw = process.env[name]
  if (raw === undefined) return undefined
  const n = Number(raw)
  return Number.isFinite(n) ? n : undefined
}

function resolvePool(): "forks" | "threads" | "vmThreads" | undefined {
  const raw = process.env.VITEST_POOL
  if (!raw) return undefined
  return VALID_POOLS.has(raw)
    ? (raw as "forks" | "threads" | "vmThreads")
    : undefined
}

function activeThresholds(): ThresholdPreset {
  const strict = process.env.VITEST_COVERAGE_STRICT === "1"
  const base = strict ? COVERAGE_PRESETS.strict : COVERAGE_PRESETS.default
  return {
    lines: parseEnvNumber("VITEST_COVERAGE_LINES") ?? base.lines,
    statements: parseEnvNumber("VITEST_COVERAGE_STATEMENTS") ?? base.statements,
    functions: parseEnvNumber("VITEST_COVERAGE_FUNCTIONS") ?? base.functions,
    branches: parseEnvNumber("VITEST_COVERAGE_BRANCHES") ?? base.branches,
  }
}

/**
 * Shared Vitest `test` block defaults for Afenda apps and packages.
 * Reads `process.env` for pool and coverage overrides (see packages/vitest-config/TESTING.md).
 */
export function getAfendaVitestTestOptions(
  options: AfendaVitestOptions = {}
): NonNullable<UserConfig["test"]> {
  const environment: VitestEnvironment = options.environment ?? "jsdom"
  const setupFilesOption = options.setupFiles

  const setupFiles: string[] | undefined =
    setupFilesOption === undefined
      ? environment === "node"
        ? []
        : [afendaVitestSetupFile]
      : setupFilesOption

  const pool = resolvePool()

  const thresholds = activeThresholds()

  return {
    globals: true,
    environment,
    include: [
      // Singular `__test__` (legacy / some templates)
      "src/**/__test__/**/*.{test,spec}.{ts,tsx}",
      // Plural `__tests__` anywhere under the project root, at any folder depth:
      // - files directly in `__tests__/` (`**/__tests__/*`)
      // - files in nested dirs under `__tests__/` (`**/__tests__/**/*`)
      "**/__tests__/*.{test,spec}.{ts,tsx}",
      "**/__tests__/**/*.{test,spec}.{ts,tsx}",
    ],
    setupFiles,
    pool: pool ?? "threads",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      thresholds: {
        lines: thresholds.lines,
        statements: thresholds.statements,
        functions: thresholds.functions,
        branches: thresholds.branches,
      },
    },
    // Stable, Jest-like mock semantics for shared utilities
    mockReset: true,
  }
}

/**
 * Node-environment defaults without jest-dom setup (pure packages).
 */
export function getAfendaVitestNodeTestOptions(
  options: Pick<AfendaVitestOptions, "setupFiles"> = {}
): NonNullable<UserConfig["test"]> {
  return getAfendaVitestTestOptions({
    environment: "node",
    setupFiles: options.setupFiles ?? [],
  })
}
