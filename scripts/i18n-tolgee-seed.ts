/**
 * Seeds a self-hosted Tolgee instance with all Afenda locale translations.
 *
 * Prerequisites:
 *   1. Tolgee running (docker compose -f docker-compose.tolgee.yml up -d)
 *   2. Log in at http://localhost:8085, create a project, note the project ID
 *   3. Generate a PAT (Personal Access Token) or project API key
 *   4. Set TOLGEE_* in repo root `.env` (see `.env.example`)
 *
 * Run: pnpm run script:i18n-tolgee-seed
 */
import { readFileSync, readdirSync, existsSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

import { loadMonorepoEnvLayered } from "@afenda/env-loader"

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(__dirname, "..")
const localesDir = join(repoRoot, "apps/web/src/app/_platform/i18n/locales")

loadMonorepoEnvLayered()

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

function loadEnv(): { apiUrl: string; projectId: string; apiKey: string } {
  const apiUrl = process.env.TOLGEE_API_URL
  const projectId = process.env.TOLGEE_PROJECT_ID
  const apiKey = process.env.TOLGEE_API_KEY

  if (!apiUrl || !projectId || !apiKey) {
    throw new Error(
      "TOLGEE_API_URL, TOLGEE_PROJECT_ID, and TOLGEE_API_KEY must be set in repo root `.env` (see `.env.example`)."
    )
  }

  return { apiUrl: apiUrl.replace(/\/$/, ""), projectId, apiKey }
}

function authHeaders(apiKey: string): Record<string, string> {
  if (apiKey.startsWith("tgpat_")) {
    return { "X-API-Key": apiKey }
  }
  return { Authorization: `Bearer ${apiKey}` }
}

type KeyImport = {
  name: string
  namespace: string
  translations: Record<string, string>
  tags: string[]
}

function buildKeyImports(): KeyImport[] {
  const locales = readdirSync(localesDir).filter((d) => {
    const stat = readdirSync(join(localesDir, d))
    return stat.length > 0
  })

  const namespaces = readdirSync(join(localesDir, "en"))
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(/\.json$/, ""))

  const keyMap = new Map<
    string,
    { ns: string; leaf: string; translations: Record<string, string> }
  >()

  for (const locale of locales) {
    for (const ns of namespaces) {
      const filePath = join(localesDir, locale, `${ns}.json`)
      if (!existsSync(filePath)) continue
      const raw = JSON.parse(readFileSync(filePath, "utf8")) as unknown
      const flat = flattenLeaves(raw)
      for (const [leaf, value] of Object.entries(flat)) {
        const compositeKey = `${ns}.${leaf}`
        let entry = keyMap.get(compositeKey)
        if (!entry) {
          entry = { ns, leaf, translations: {} }
          keyMap.set(compositeKey, entry)
        }
        entry.translations[locale] = value
      }
    }
  }

  const imports: KeyImport[] = []
  for (const [, entry] of keyMap) {
    imports.push({
      name: entry.leaf,
      namespace: entry.ns,
      translations: entry.translations,
      tags: ["seed"],
    })
  }

  return imports.sort(
    (a, b) =>
      a.namespace.localeCompare(b.namespace) || a.name.localeCompare(b.name)
  )
}

async function ensureLanguages(
  apiUrl: string,
  projectId: string,
  apiKey: string,
  tags: string[]
): Promise<void> {
  const res = await fetch(
    `${apiUrl}/v2/projects/${projectId}/languages?size=100`,
    {
      headers: authHeaders(apiKey),
    }
  )
  if (!res.ok) {
    throw new Error(`Failed to list languages: ${res.status} ${res.statusText}`)
  }
  const body = (await res.json()) as {
    _embedded?: { languages?: Array<{ tag: string }> }
  }
  const existing = new Set(body._embedded?.languages?.map((l) => l.tag) ?? [])

  const languageMeta: Record<string, { name: string; originalName: string }> = {
    en: { name: "English", originalName: "English" },
    ms: { name: "Malay", originalName: "Bahasa Melayu" },
    id: { name: "Indonesian", originalName: "Bahasa Indonesia" },
    vi: { name: "Vietnamese", originalName: "Tiếng Việt" },
  }

  for (const tag of tags) {
    if (existing.has(tag)) continue
    const meta = languageMeta[tag] ?? { name: tag, originalName: tag }
    const createRes = await fetch(
      `${apiUrl}/v2/projects/${projectId}/languages`,
      {
        method: "POST",
        headers: { ...authHeaders(apiKey), "Content-Type": "application/json" },
        body: JSON.stringify({
          tag,
          name: meta.name,
          originalName: meta.originalName,
        }),
      }
    )
    if (!createRes.ok) {
      const text = await createRes.text()
      throw new Error(
        `Failed to create language "${tag}": ${createRes.status} ${text}`
      )
    }
    console.log(`  Created language: ${tag} (${meta.name})`)
  }
}

async function importBatch(
  apiUrl: string,
  projectId: string,
  apiKey: string,
  keys: KeyImport[]
): Promise<void> {
  const res = await fetch(`${apiUrl}/v2/projects/${projectId}/keys/import`, {
    method: "POST",
    headers: { ...authHeaders(apiKey), "Content-Type": "application/json" },
    body: JSON.stringify({ keys }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Import failed: ${res.status} ${text}`)
  }
}

const BATCH_SIZE = 50

async function main(): Promise<void> {
  const { apiUrl, projectId, apiKey } = loadEnv()
  const keys = buildKeyImports()

  console.log(`Loaded ${keys.length} keys from ${localesDir}`)
  console.log(`Target: ${apiUrl}/v2/projects/${projectId}\n`)

  const allLocales = [
    ...new Set(keys.flatMap((k) => Object.keys(k.translations))),
  ]
  console.log(`Ensuring languages exist: ${allLocales.join(", ")}`)
  await ensureLanguages(apiUrl, projectId, apiKey, allLocales)

  console.log(`\nImporting ${keys.length} keys in batches of ${BATCH_SIZE}...`)
  let imported = 0
  for (let i = 0; i < keys.length; i += BATCH_SIZE) {
    const batch = keys.slice(i, i + BATCH_SIZE)
    await importBatch(apiUrl, projectId, apiKey, batch)
    imported += batch.length
    console.log(`  ${imported}/${keys.length} keys imported`)
  }

  console.log(
    `\nSeed complete. ${imported} keys across ${allLocales.length} languages.`
  )
  console.log(`View at: ${apiUrl}`)
}

main().catch((err) => {
  console.error("Tolgee seed failed:", err)
  process.exit(1)
})
