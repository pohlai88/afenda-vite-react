import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import {
  ALL_NAMESPACES,
  CANONICAL_LOCALE,
  GLOSSARY_IDENTICAL_OK_KEYS,
  IDENTICAL_RATIO_EXCLUDED_PREFIXES,
  NON_EN_APPROVED_RATIO_THRESHOLD,
  RELEASE_NAMESPACES,
  SUPPORTED_LOCALES,
  type SupportedLocale,
  type TranslationNamespace,
} from "../policy/i18n-policy"
import lifecycle from "../policy/i18n-unused-key-lifecycle.json"

type FlatResource = Record<string, string>
type ResourceByNamespace = Partial<Record<TranslationNamespace, FlatResource>>
type ResourceByLocale = Partial<Record<SupportedLocale, ResourceByNamespace>>
type I18nUnusedKeyLifecycle = {
  readonly allowedUnusedKeys: readonly string[]
  readonly allowedUnusedKeyPrefixes: readonly string[]
}

export type I18nPolicyReport = {
  readonly errors: readonly string[]
  readonly warnings: readonly string[]
}

type I18nPolicyReportInput = {
  readonly resources: ResourceByLocale
  readonly lifecycle: I18nUnusedKeyLifecycle
  readonly usedKeys?: ReadonlySet<string>
}

const i18nRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
)
const localeRoot = path.join(i18nRoot, "locales")
const sourceRoot = path.resolve(i18nRoot, "../../..")

function flattenLeaves(value: unknown, prefix = ""): FlatResource {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return {}
  }

  const out: FlatResource = {}

  for (const [key, nestedValue] of Object.entries(value)) {
    const next = prefix ? `${prefix}.${key}` : key

    if (typeof nestedValue === "string") {
      out[next] = nestedValue
      continue
    }

    Object.assign(out, flattenLeaves(nestedValue, next))
  }

  return out
}

function readJsonFile(filePath: string): unknown {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as unknown
}

function readResourceTree(root = localeRoot): ResourceByLocale {
  const resources: ResourceByLocale = {}

  for (const locale of SUPPORTED_LOCALES) {
    resources[locale] = {}

    for (const namespace of ALL_NAMESPACES) {
      const filePath = path.join(root, locale, `${namespace}.json`)

      if (!fs.existsSync(filePath)) {
        continue
      }

      resources[locale][namespace] = flattenLeaves(readJsonFile(filePath))
    }
  }

  return resources
}

function extractInterpolationTokens(value: string): string[] {
  return [
    ...new Set(
      [...value.matchAll(/\{\{\s*([^{}\s]+)\s*\}\}/g)].map((match) => match[1])
    ),
  ].sort()
}

function keyId(namespace: TranslationNamespace, key: string): string {
  return `${namespace}.${key}`
}

function isApprovedIdenticalKey(key: string): boolean {
  return (
    GLOSSARY_IDENTICAL_OK_KEYS.includes(key) ||
    IDENTICAL_RATIO_EXCLUDED_PREFIXES.some((prefix) => key.startsWith(prefix))
  )
}

export function isAllowedUnusedKey(
  key: string,
  unusedKeyLifecycle: I18nUnusedKeyLifecycle
): boolean {
  return (
    unusedKeyLifecycle.allowedUnusedKeys.includes(key) ||
    unusedKeyLifecycle.allowedUnusedKeyPrefixes.some((prefix) =>
      key.startsWith(prefix)
    )
  )
}

function scanSourceFiles(root = sourceRoot): ReadonlySet<string> {
  const usedKeys = new Set<string>()
  const extensions = new Set([".ts", ".tsx"])

  function walk(dir: string): void {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const entryPath = path.join(dir, entry.name)

      if (entry.isDirectory()) {
        if (
          entryPath.includes(`${path.sep}locales${path.sep}`) ||
          entryPath.includes(`${path.sep}audit${path.sep}`) ||
          entryPath.includes(`${path.sep}glossary${path.sep}`)
        ) {
          continue
        }

        walk(entryPath)
        continue
      }

      if (!extensions.has(path.extname(entry.name))) {
        continue
      }

      const source = fs.readFileSync(entryPath, "utf8")
      const namespaceMatches = [
        ...source.matchAll(/useTranslation\(\s*["']([^"']+)["']\s*\)/g),
      ]
      const fileNamespaces = namespaceMatches
        .map((match) => match[1])
        .filter((namespace): namespace is TranslationNamespace =>
          ALL_NAMESPACES.includes(namespace as TranslationNamespace)
        )

      for (const match of source.matchAll(
        /(?:\bt\b|i18n\.t)\(\s*["']([^"']+)["']/g
      )) {
        const rawKey = match[1]

        if (rawKey.includes(":")) {
          const [namespace, key] = rawKey.split(":", 2)
          if (ALL_NAMESPACES.includes(namespace as TranslationNamespace)) {
            usedKeys.add(keyId(namespace as TranslationNamespace, key))
          }
          continue
        }

        for (const namespace of fileNamespaces) {
          usedKeys.add(keyId(namespace, rawKey))
        }
      }
    }
  }

  walk(root)

  return usedKeys
}

export function createI18nPolicyReport({
  resources,
  lifecycle: unusedKeyLifecycle,
  usedKeys,
}: I18nPolicyReportInput): I18nPolicyReport {
  const errors: string[] = []
  const warnings: string[] = []
  const canonicalResources = resources[CANONICAL_LOCALE] ?? {}

  for (const locale of SUPPORTED_LOCALES) {
    for (const namespace of ALL_NAMESPACES) {
      if (!resources[locale]?.[namespace]) {
        errors.push(
          `Missing locale namespace file: ${locale}/${namespace}.json`
        )
      }
    }
  }

  for (const namespace of RELEASE_NAMESPACES) {
    const canonical = canonicalResources[namespace] ?? {}
    const canonicalKeys = Object.keys(canonical)

    for (const locale of SUPPORTED_LOCALES) {
      if (locale === CANONICAL_LOCALE) {
        continue
      }

      const target = resources[locale]?.[namespace] ?? {}
      const presentCount = canonicalKeys.filter((key) => key in target).length
      const ratio = canonicalKeys.length
        ? presentCount / canonicalKeys.length
        : 1

      if (ratio < NON_EN_APPROVED_RATIO_THRESHOLD) {
        errors.push(
          `${locale}/${namespace}.json completeness ${ratio.toFixed(2)} is below ${NON_EN_APPROVED_RATIO_THRESHOLD}`
        )
      }
    }
  }

  for (const namespace of ALL_NAMESPACES) {
    const canonical = canonicalResources[namespace] ?? {}

    for (const locale of SUPPORTED_LOCALES) {
      if (locale === CANONICAL_LOCALE) {
        continue
      }

      const target = resources[locale]?.[namespace] ?? {}

      for (const [key, canonicalValue] of Object.entries(canonical)) {
        const targetValue = target[key]

        if (targetValue === undefined) {
          continue
        }

        const canonicalTokens = extractInterpolationTokens(canonicalValue)
        const targetTokens = extractInterpolationTokens(targetValue)

        if (
          canonicalTokens.length !== targetTokens.length ||
          canonicalTokens.some((token, index) => token !== targetTokens[index])
        ) {
          errors.push(
            `${locale}/${namespace}.json ${key} interpolation tokens differ from English`
          )
        }

        const fullKey = keyId(namespace, key)
        if (
          targetValue === canonicalValue &&
          !isApprovedIdenticalKey(fullKey)
        ) {
          warnings.push(`${locale}.${fullKey} is identical to English`)
        }
      }
    }
  }

  if (usedKeys) {
    for (const namespace of ALL_NAMESPACES) {
      const canonical = canonicalResources[namespace] ?? {}

      for (const key of Object.keys(canonical)) {
        const fullKey = keyId(namespace, key)

        if (usedKeys.has(fullKey)) {
          continue
        }

        if (isAllowedUnusedKey(fullKey, unusedKeyLifecycle)) {
          warnings.push(`Allowed unused key: ${fullKey}`)
          continue
        }

        errors.push(`Unknown unused key: ${fullKey}`)
      }
    }
  }

  return { errors, warnings }
}

function printReport(report: I18nPolicyReport): void {
  const allowedUnusedWarnings = report.warnings.filter((warning) =>
    warning.startsWith("Allowed unused key:")
  )
  const identicalWarnings = report.warnings.filter((warning) =>
    warning.endsWith("is identical to English")
  )
  const otherWarnings = report.warnings.filter(
    (warning) =>
      !allowedUnusedWarnings.includes(warning) &&
      !identicalWarnings.includes(warning)
  )

  if (allowedUnusedWarnings.length > 0) {
    console.warn(
      `[i18n-policy] warning: ${allowedUnusedWarnings.length} unused keys are allowed by lifecycle policy`
    )
  }

  if (identicalWarnings.length > 0) {
    console.warn(
      `[i18n-policy] warning: ${identicalWarnings.length} translations are identical to English and should be reviewed`
    )
  }

  for (const warning of otherWarnings) {
    console.warn(`[i18n-policy] warning: ${warning}`)
  }

  for (const error of report.errors) {
    console.error(`[i18n-policy] error: ${error}`)
  }
}

function isMainModule(): boolean {
  return process.argv[1] === fileURLToPath(import.meta.url)
}

if (isMainModule()) {
  const unusedOnly = process.argv.includes("--unused")
  const resources = readResourceTree()
  const usedKeys = scanSourceFiles()
  const report = createI18nPolicyReport({
    resources,
    lifecycle,
    usedKeys,
  })
  const filteredReport = unusedOnly
    ? {
        errors: report.errors.filter((error) =>
          error.startsWith("Unknown unused key:")
        ),
        warnings: report.warnings.filter((warning) =>
          warning.includes("unused key")
        ),
      }
    : report

  printReport(filteredReport)

  if (filteredReport.errors.length > 0) {
    process.exitCode = 1
  }
}
