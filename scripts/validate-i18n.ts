/**
 * Validates locale parity, release-namespace quality gates, glossary key presence,
 * unresolved audit conflicts, and hardcoded JSX string literals. Run from repo root:
 * `pnpm run script:validate-i18n`
 */
import { readFileSync, readdirSync, existsSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

import {
  GLOSSARY_IDENTICAL_OK_KEYS,
  IDENTICAL_RATIO_EXCLUDED_PREFIXES,
  NON_EN_APPROVED_RATIO_THRESHOLD,
  RELEASE_NAMESPACES,
  SUPPORTED_LOCALES,
} from "../apps/web/src/app/_platform/i18n/policy/i18n-policy.js"

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(__dirname, "..")
const localesRoot = join(repoRoot, "apps/web/src/app/_platform/i18n/locales")
const glossaryPath = join(
  repoRoot,
  "apps/web/src/app/_platform/i18n/glossary/canonical-terms.json"
)
const conflictsPath = join(
  repoRoot,
  "apps/web/src/app/_platform/i18n/audit/conflicts.json"
)
const provenancePath = join(
  repoRoot,
  "apps/web/src/app/_platform/i18n/audit/provenance.json"
)

type FlatMap = Record<string, string>

function flattenLeaves(obj: unknown, prefix = ""): FlatMap {
  if (obj === null || typeof obj !== "object" || Array.isArray(obj)) {
    return {}
  }
  const out: FlatMap = {}
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    const next = prefix ? `${prefix}.${k}` : k
    if (typeof v === "string") {
      out[next] = v
    } else {
      Object.assign(out, flattenLeaves(v, next))
    }
  }
  return out
}

function loadNamespaceLocale(locale: string, ns: string): FlatMap {
  const path = join(localesRoot, locale, `${ns}.json`)
  const raw = JSON.parse(readFileSync(path, "utf8")) as unknown
  return flattenLeaves(raw)
}

function fullKey(ns: string, leaf: string): string {
  return `${ns}.${leaf}`
}

function isExcludedFromNonEnRatio(fk: string): boolean {
  if (GLOSSARY_IDENTICAL_OK_KEYS.includes(fk)) return true
  return IDENTICAL_RATIO_EXCLUDED_PREFIXES.some((prefix: string) =>
    fk.startsWith(prefix)
  )
}

type GlossaryFile = {
  terms: Array<{ canonicalKey: string; en: string }>
}

type ConflictsFile = {
  items: Array<{
    afendaKey: string
    status: string
    resolutionSource?: string
    tolgeeCandidate?: string
    glossaryValue?: string
  }>
}

type ProvenanceFile = {
  version: number
  generatedAt?: string
  entries: Array<{
    afendaKey: string
    sourceSystem: string
    sourceTier?: string
    sourceLocale: string
    sourcePath: string
    importTimestamp: string
    candidateValue: string
    decisionStatus: string
  }>
}

function main(): void {
  const errors: string[] = []
  const canonical = SUPPORTED_LOCALES[0]
  if (canonical !== "en") {
    errors.push("Expected first supported locale to be canonical `en`.")
  }

  const locales = [...SUPPORTED_LOCALES]
  const namespaces = readdirSync(join(localesRoot, "en"))
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(/\.json$/, ""))

  const enMaps: Record<string, FlatMap> = {}
  for (const ns of namespaces) {
    enMaps[ns] = loadNamespaceLocale("en", ns)
  }

  /** ns -> leaf -> value per locale */
  const byLocale: Record<string, Record<string, FlatMap>> = {}
  for (const loc of locales) {
    byLocale[loc] = {}
    for (const ns of namespaces) {
      byLocale[loc][ns] = loadNamespaceLocale(loc, ns)
    }
  }

  for (const ns of namespaces) {
    const enKeys = new Set(Object.keys(enMaps[ns]))
    for (const loc of locales) {
      const m = byLocale[loc][ns]
      const locKeys = new Set(Object.keys(m))
      for (const k of enKeys) {
        if (!locKeys.has(k)) {
          errors.push(`Missing key \`${fullKey(ns, k)}\` in locale "${loc}".`)
        }
      }
      for (const k of locKeys) {
        if (!enKeys.has(k)) {
          errors.push(
            `Extra key \`${fullKey(ns, k)}\` in locale "${loc}" vs English.`
          )
        }
      }
      for (const k of enKeys) {
        const v = m[k] ?? ""
        if (v.trim() === "") {
          errors.push(
            `Empty value for \`${fullKey(ns, k)}\` in locale "${loc}".`
          )
        }
      }
    }
  }

  for (const ns of RELEASE_NAMESPACES) {
    if (!enMaps[ns]) {
      errors.push(`Release namespace "${ns}" has no English resource file.`)
      continue
    }
    const enFlat = enMaps[ns]
    const enKeys = Object.keys(enFlat)
    for (const loc of locales) {
      if (loc === "en") continue
      const m = byLocale[loc][ns]
      let identical = 0
      let total = 0
      for (const k of enKeys) {
        const fk = fullKey(ns, k)
        if (isExcludedFromNonEnRatio(fk)) continue
        total += 1
        if (m[k] === enFlat[k]) identical += 1
      }
      if (total === 0) continue
      const ratioDifferent = (total - identical) / total
      if (ratioDifferent < NON_EN_APPROVED_RATIO_THRESHOLD) {
        errors.push(
          `Locale "${loc}" namespace "${ns}": localized ratio ${(ratioDifferent * 100).toFixed(1)}% differs from English; require ≥ ${(NON_EN_APPROVED_RATIO_THRESHOLD * 100).toFixed(0)}% (non-identical to en, allowlist excluded).`
        )
      }
    }
  }

  const glossary = JSON.parse(
    readFileSync(glossaryPath, "utf8")
  ) as GlossaryFile
  for (const term of glossary.terms) {
    const parts = term.canonicalKey.split(".")
    if (parts.length < 2) {
      errors.push(`Invalid glossary canonicalKey "${term.canonicalKey}".`)
      continue
    }
    const [gNs, ...rest] = parts
    const leaf = rest.join(".")
    const enNs = enMaps[gNs]
    if (!enNs) {
      errors.push(
        `Glossary key "${term.canonicalKey}" references unknown namespace "${gNs}".`
      )
      continue
    }
    if (!(leaf in enNs)) {
      errors.push(
        `Glossary canonicalKey "${term.canonicalKey}" not found in English namespace "${gNs}".`
      )
      continue
    }
    if (enNs[leaf] !== term.en) {
      errors.push(
        `Glossary English for "${term.canonicalKey}" (${JSON.stringify(term.en)}) does not match locale file (${JSON.stringify(enNs[leaf])}).`
      )
    }
  }

  const conflicts = JSON.parse(
    readFileSync(conflictsPath, "utf8")
  ) as ConflictsFile
  for (const row of conflicts.items) {
    const ns = row.afendaKey.split(".")[0] ?? ""
    const isReleaseNs = (RELEASE_NAMESPACES as readonly string[]).includes(ns)
    if (!isReleaseNs) continue

    if (row.status === "review") {
      errors.push(
        `Unresolved audit conflict (review) for release namespace: ${row.afendaKey}`
      )
    }
    if (row.resolutionSource === "platform_conflict") {
      errors.push(
        `Primary platform conflict for release namespace key ${row.afendaKey}: platform=${JSON.stringify(row.tolgeeCandidate)} glossary=${JSON.stringify(row.glossaryValue)}`
      )
    }
    if (row.glossaryValue && !row.tolgeeCandidate) {
      errors.push(
        `Primary platform missing candidate for release namespace key ${row.afendaKey}`
      )
    }
  }

  const prov = JSON.parse(
    readFileSync(provenancePath, "utf8")
  ) as ProvenanceFile
  if (!prov.entries || prov.entries.length === 0) {
    errors.push(
      "Provenance file has no entries; corpus ingestion may not have run."
    )
  }
  for (const entry of prov.entries) {
    if (!entry.afendaKey || !entry.sourceSystem || !entry.sourcePath) {
      errors.push(`Incomplete provenance entry: ${JSON.stringify(entry)}`)
    }
    if (!["tolgee", "frappe", "odoo"].includes(entry.sourceSystem)) {
      errors.push(`Unknown provenance source system: ${entry.sourceSystem}`)
    }
    if (
      entry.sourceTier &&
      !["primary", "reference"].includes(entry.sourceTier)
    ) {
      errors.push(`Unknown provenance source tier: ${entry.sourceTier}`)
    }
  }

  // ── Hardcoded JSX string literal detection ──────────────────────────
  const jsxWarnings = scanForHardcodedJsxStrings(repoRoot)
  for (const w of jsxWarnings) {
    errors.push(w)
  }

  if (errors.length) {
    console.error("i18n validation failed:\n")
    for (const e of errors) console.error(`- ${e}`)
    process.exit(1)
  }

  console.log("i18n validation passed.")
}

const HARDCODED_ALLOWED_PATTERNS = [
  /^\s*$/,
  /^[.·—–|/\\:;,!?…→←↓↑•#*+\-=<>{}()\[\]@&%$"'`~^]+$/,
  /^\s*\d+\s*$/,
  /^(className|id|htmlFor|data-testid|to|href|key|name|type|value|method|action|src)$/,
]

const HARDCODED_SCAN_DIRS = ["apps/web/src/pages", "apps/web/src/app"]

const HARDCODED_SKIP_FILES = [
  "router.tsx",
  "feature-routes.tsx",
  "marketing-routes.tsx",
  "query-provider.tsx",
]

function collectTsxFiles(dir: string): string[] {
  if (!existsSync(dir)) return []
  const out: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      out.push(...collectTsxFiles(full))
    } else if (
      entry.name.endsWith(".tsx") &&
      !HARDCODED_SKIP_FILES.includes(entry.name)
    ) {
      out.push(full)
    }
  }
  return out
}

function scanForHardcodedJsxStrings(root: string): string[] {
  const warnings: string[] = []
  const tsxFiles = HARDCODED_SCAN_DIRS.flatMap((d) =>
    collectTsxFiles(join(root, d))
  )

  // Match: >SomeText< (text nodes between JSX tags)
  const jsxTextPattern = />([^<>{]*[a-zA-Z]{3,}[^<>{}]*)</g
  // Match: attribute="Some string" where the attribute is user-visible
  const attrPattern = /\b(aria-label|title|alt|placeholder)\s*=\s*"([^"]+)"/g

  for (const file of tsxFiles) {
    const content = readFileSync(file, "utf8")
    const relPath = file.replace(root, "").replace(/\\/g, "/")
    const lines = content.split("\n")

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Skip lines that use t() or template literals with t()
      if (line.includes("t(") || line.includes("{t(")) continue
      // Skip import/export lines
      if (/^\s*(import|export)\s/.test(line)) continue
      // Skip comments
      if (/^\s*(\/\/|\/\*|\*)/.test(line)) continue

      let match: RegExpExecArray | null

      jsxTextPattern.lastIndex = 0
      while ((match = jsxTextPattern.exec(line)) !== null) {
        const text = match[1].trim()
        if (HARDCODED_ALLOWED_PATTERNS.some((p) => p.test(text))) continue
        if (text.length < 3) continue
        // Skip JSX expressions (contains { or })
        if (text.includes("{") || text.includes("}")) continue
        warnings.push(
          `Hardcoded JSX text in ${relPath}:${i + 1}: "${text.slice(0, 60)}"`
        )
      }

      attrPattern.lastIndex = 0
      while ((match = attrPattern.exec(line)) !== null) {
        const attrValue = match[2].trim()
        if (HARDCODED_ALLOWED_PATTERNS.some((p) => p.test(attrValue))) continue
        warnings.push(
          `Hardcoded a11y attribute "${match[1]}" in ${relPath}:${i + 1}: "${attrValue.slice(0, 60)}"`
        )
      }
    }
  }

  return warnings
}

main()
