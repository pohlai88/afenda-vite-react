/**
 * Regenerates the "Current Status" table in
 * packages/shadcn-ui/shell/SHELL_COMPONENTS_GUARDRAILS.md
 * from shell-component-registry.ts (live contract + registry truth).
 *
 * Usage:
 *   pnpm run script:generate-shell-components-guardrails
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"

import { findRepoRoot, normalizePath } from "../tools/ui-drift/shared/index.js"

const MARKER_BEGIN = "<!-- shell-components-current-status:begin -->"
const MARKER_END = "<!-- shell-components-current-status:end -->"

const GUARDRAILS_REL =
  "packages/shadcn-ui/src/lib/constant/policy/shell/SHELL_COMPONENTS_GUARDRAILS.md"
const SHELL_UI_RUNTIME_PREFIX = "apps/web/src/share/components/shell-ui"

const ROOT_DIR = normalizePath(findRepoRoot())

interface RegistryEntry {
  key: string
  componentName: string
  zone: string | null
  kind: string
}

async function loadShellComponentRegistry(): Promise<
  Record<string, RegistryEntry>
> {
  const moduleUrl = new URL(
    `file://${path
      .join(
        ROOT_DIR,
        "packages/shadcn-ui/src/lib/constant/policy/shell/registry/shell-component-registry.ts"
      )
      .replace(/\\/g, "/")}`
  ).href

  const module = (await import(moduleUrl)) as {
    shellComponentRegistry?: Record<string, RegistryEntry>
  }

  if (!module.shellComponentRegistry || typeof module.shellComponentRegistry !== "object") {
    throw new Error(
      "Unable to load shellComponentRegistry from shell-component-registry.ts."
    )
  }

  return module.shellComponentRegistry
}

function escapeTableCell(value: string): string {
  return value.replace(/\|/g, "\\|")
}

function runtimeFileRelative(key: string): string {
  return `${SHELL_UI_RUNTIME_PREFIX}/components/${key}.tsx`
}

function buildGeneratedBlock(entries: RegistryEntry[]): {
  markdown: string
  missingRuntime: string[]
} {
  const sorted = [...entries].sort((a, b) => a.key.localeCompare(b.key))
  const missingRuntime: string[] = []

  const rows = sorted.map((entry) => {
    const zone =
      entry.zone === null || entry.zone === undefined
        ? "—"
        : `\`${entry.zone}\``
    const kind = `\`${entry.kind}\``
    const rel = runtimeFileRelative(entry.key)
    const abs = path.join(ROOT_DIR, rel)
    const exists = existsSync(abs)
    if (!exists) {
      missingRuntime.push(rel)
    }
    const runtimeCell = exists
      ? `\`${rel}\``
      : `*(missing)* \`${rel}\``
    return `| \`${escapeTableCell(entry.key)}\` | \`${escapeTableCell(entry.componentName)}\` | ${zone} | ${kind} | ${runtimeCell} |`
  })

  const header =
    "| Key | Component | Zone | Kind | Runtime file |\n| --- | --- | --- | --- | --- |"

  const markdown = [
    "",
    "> **Generated** — do not edit between markers. Run `pnpm run script:generate-shell-components-guardrails`.",
    "",
    header,
    ...rows,
    "",
  ].join("\n")

  return { markdown, missingRuntime }
}

function patchGuardrailsDoc(generatedInner: string): void {
  const docPath = path.join(ROOT_DIR, GUARDRAILS_REL)
  const content = readFileSync(docPath, "utf8")

  const startIdx = content.indexOf(MARKER_BEGIN)
  const endIdx = content.indexOf(MARKER_END, startIdx + MARKER_BEGIN.length)

  if (startIdx === -1 || endIdx === -1) {
    throw new Error(
      `${GUARDRAILS_REL} must contain ${MARKER_BEGIN} and ${MARKER_END}.`
    )
  }

  const next =
    content.slice(0, startIdx + MARKER_BEGIN.length) +
    generatedInner +
    content.slice(endIdx)

  writeFileSync(docPath, next, "utf8")
}

async function main(): Promise<void> {
  const registry = await loadShellComponentRegistry()
  const entries = Object.values(registry) as RegistryEntry[]

  const { markdown, missingRuntime } = buildGeneratedBlock(entries)
  patchGuardrailsDoc(markdown)

  console.log(
    `Updated ${GUARDRAILS_REL} with ${entries.length} shell component row(s).`
  )
  if (missingRuntime.length > 0) {
    console.warn(
      "Warning: expected runtime file(s) missing (table shows *(missing)*):"
    )
    for (const rel of missingRuntime) {
      console.warn(`  - ${rel}`)
    }
  }
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(2)
})
