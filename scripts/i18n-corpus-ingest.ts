/**
 * Fetches/loads translation corpora for audit:
 *   - Tolgee (primary ops platform): API export when configured, local fallback otherwise
 *   - Frappe/ERPNext (reference corpus)
 *   - Odoo (reference corpus)
 *
 * Sources (PO/POT — gettext format):
 *   - frappe/frappe    → frappe/locale/main.pot + {locale}.po
 *   - frappe/erpnext   → erpnext/locale/main.pot + {locale}.po
 *   - odoo/odoo        → addons/{addon}/i18n/{addon}.pot + {locale}.po
 *
 * Mapping:
 *   scripts/data/i18n-key-mapping.json maps upstream source terms (msgid)
 *   to Afenda canonical keys.
 *
 * Run: pnpm run script:i18n-corpus-ingest
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { parseDolibarrLang, parsePo } from './i18n-parse-po.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(__dirname, '..')
const dataDir = join(repoRoot, 'scripts/data')
const i18nLocalesDir = join(repoRoot, 'apps/web/src/share/i18n/locales')

// Load .env.tolgee if present (fills TOLGEE_* env vars for local runs)
const envTolgeePath = join(repoRoot, '.env.tolgee')
if (existsSync(envTolgeePath)) {
  for (const line of readFileSync(envTolgeePath, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq <= 0) continue
    const key = trimmed.slice(0, eq).trim()
    if (!process.env[key]) {
      process.env[key] = trimmed.slice(eq + 1).trim()
    }
  }
}

const SUPPORTED_LOCALES = ['en', 'ms', 'id', 'vi'] as const

const FRAPPE_BASE =
  'https://raw.githubusercontent.com/frappe/frappe/develop/frappe/locale'
const ERPNEXT_BASE =
  'https://raw.githubusercontent.com/frappe/erpnext/develop/erpnext/locale'
const ODOO_BASE = 'https://raw.githubusercontent.com/odoo/odoo/master/addons'
const DOLIBARR_MS_DIR_API =
  'https://api.github.com/repos/Dolibarr/dolibarr/contents/htdocs/langs/ms_MY'

type KeyMapping = {
  version: number
  mappings: Array<{
    afendaKey: string
    frappe?: { sourceId: string; module: string }
    odoo?: { sourceId: string; addon: string }
  }>
}

type CorpusEntry = {
  afendaKey: string
  locale: string
  sourcePath: string
  value: string
}

type CorpusFile = {
  version: number
  source: string
  generatedAt: string
  fetchedFrom: string[]
  entries: CorpusEntry[]
}

type DolibarrMsCandidate = {
  value: string
  sourcePath: string
}

type DolibarrDirectoryItem = {
  type: 'file' | 'dir'
  name: string
  download_url: string | null
}

type FlatMap = Record<string, string>

async function fetchText(url: string): Promise<string | null> {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    return await res.text()
  } catch {
    return null
  }
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  }
}

function flattenLeaves(obj: unknown, prefix = ''): FlatMap {
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
    return {}
  }
  const out: FlatMap = {}
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    const next = prefix ? `${prefix}.${k}` : k
    if (typeof v === 'string') {
      out[next] = v
    } else {
      Object.assign(out, flattenLeaves(v, next))
    }
  }
  return out
}

function getLocaleNamespaces(locale: string): string[] {
  return readdirSync(join(i18nLocalesDir, locale))
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace(/\.json$/, ''))
    .sort((a, b) => a.localeCompare(b))
}

function loadLocalTolgeeEntries(): CorpusEntry[] {
  const entries: CorpusEntry[] = []
  for (const locale of SUPPORTED_LOCALES) {
    const namespaces = getLocaleNamespaces(locale)
    for (const ns of namespaces) {
      const filePath = join(i18nLocalesDir, locale, `${ns}.json`)
      const raw = JSON.parse(readFileSync(filePath, 'utf8')) as unknown
      const flat = flattenLeaves(raw)
      for (const [leaf, value] of Object.entries(flat)) {
        entries.push({
          afendaKey: `${ns}.${leaf}`,
          locale,
          sourcePath: `apps/web/src/share/i18n/locales/${locale}/${ns}.json`,
          value,
        })
      }
    }
  }
  return entries
}

async function loadTolgeeApiEntries(
  baseUrl: string,
  projectId: string,
  apiKey: string,
): Promise<{ entries: CorpusEntry[]; fetchedFrom: string[] }> {
  const entries: CorpusEntry[] = []
  const fetchedFrom: string[] = []
  const base = baseUrl.replace(/\/$/, '')
  const headers: Record<string, string> = apiKey.startsWith('tgpat_')
    ? { 'X-API-Key': apiKey }
    : { Authorization: `Bearer ${apiKey}` }

  let page = 0
  let hasMore = true

  while (hasMore) {
    const endpoint = `${base}/v2/projects/${projectId}/translations?size=200&page=${page}&languages=${SUPPORTED_LOCALES.join(',')}`
    const res = await fetch(endpoint, { headers })
    if (!res.ok) {
      throw new Error(
        `Tolgee translations API failed (${res.status} ${res.statusText})`,
      )
    }

    type TolgeeTranslationsPage = {
      _embedded?: {
        keys?: Array<{
          keyName: string
          keyNamespace: string | null
          translations: Record<string, { text: string | null }>
        }>
      }
      page: { totalPages: number; number: number }
    }

    const body = (await res.json()) as TolgeeTranslationsPage
    fetchedFrom.push(endpoint)

    const keys = body._embedded?.keys ?? []
    for (const key of keys) {
      const ns = key.keyNamespace ?? 'common'
      const afendaKey = `${ns}.${key.keyName}`
      for (const [locale, translation] of Object.entries(key.translations)) {
        if (translation.text) {
          entries.push({
            afendaKey,
            locale,
            sourcePath: `tolgee/api/${ns}/${locale}`,
            value: translation.text,
          })
        }
      }
    }

    page++
    hasMore = page < body.page.totalPages
  }

  return { entries, fetchedFrom }
}

async function ingestTolgee(): Promise<CorpusFile> {
  const now = new Date().toISOString()
  const apiUrl = process.env.TOLGEE_API_URL
  const projectId = process.env.TOLGEE_PROJECT_ID
  const apiKey = process.env.TOLGEE_API_KEY

  if (apiUrl && projectId && apiKey) {
    const result = await loadTolgeeApiEntries(apiUrl, projectId, apiKey)
    return {
      version: 2,
      source: 'tolgee',
      generatedAt: now,
      fetchedFrom: [...new Set(result.fetchedFrom)],
      entries: result.entries.sort(
        (a, b) =>
          a.afendaKey.localeCompare(b.afendaKey) ||
          a.locale.localeCompare(b.locale),
      ),
    }
  }

  const localEntries = loadLocalTolgeeEntries()
  return {
    version: 2,
    source: 'tolgee',
    generatedAt: now,
    fetchedFrom: ['local-fallback:apps/web/src/share/i18n/locales'],
    entries: localEntries.sort(
      (a, b) =>
        a.afendaKey.localeCompare(b.afendaKey) ||
        a.locale.localeCompare(b.locale),
    ),
  }
}

function buildPoLookup(content: string): Map<string, string> {
  const map = new Map<string, string>()
  for (const e of parsePo(content)) {
    if (e.msgid) {
      map.set(e.msgid, e.msgstr || e.msgid)
    }
  }
  return map
}

function buildDolibarrPriorityOrder(name: string): number {
  const priorities = [
    'main.lang',
    'commercial.lang',
    'accountancy.lang',
    'bills.lang',
    'products.lang',
    'companies.lang',
    'hrm.lang',
    'errors.lang',
  ]
  const idx = priorities.indexOf(name)
  return idx >= 0 ? idx : Number.MAX_SAFE_INTEGER
}

async function loadDolibarrMalayLookup(
  sourceIds: Set<string>,
): Promise<{
  lookup: Map<string, DolibarrMsCandidate>
  fetchedUrls: string[]
}> {
  const lookup = new Map<string, DolibarrMsCandidate>()
  const fetchedUrls: string[] = []

  if (sourceIds.size === 0) {
    return { lookup, fetchedUrls }
  }

  const listing = await fetchJson<DolibarrDirectoryItem[]>(DOLIBARR_MS_DIR_API)
  if (!listing) {
    return { lookup, fetchedUrls }
  }
  fetchedUrls.push(DOLIBARR_MS_DIR_API)

  const files = listing
    .filter(
      (item) =>
        item.type === 'file' &&
        item.name.endsWith('.lang') &&
        item.download_url,
    )
    .sort((a, b) => {
      const pa = buildDolibarrPriorityOrder(a.name)
      const pb = buildDolibarrPriorityOrder(b.name)
      return pa - pb || a.name.localeCompare(b.name)
    })

  for (const file of files) {
    if (!file.download_url) continue
    if (lookup.size >= sourceIds.size) break

    const msUrl = file.download_url
    const enUrl = msUrl.replace('/ms_MY/', '/en_US/')

    const [msContent, enContent] = await Promise.all([
      fetchText(msUrl),
      fetchText(enUrl),
    ])
    if (!msContent || !enContent) continue

    fetchedUrls.push(msUrl, enUrl)

    const msEntries = parseDolibarrLang(msContent)
    const enEntries = parseDolibarrLang(enContent)
    const enByKey = new Map(enEntries.map((entry) => [entry.key, entry.value]))

    for (const msEntry of msEntries) {
      const enValue = enByKey.get(msEntry.key)?.trim()
      const msValue = msEntry.value.trim()
      if (!enValue || !msValue) continue
      if (enValue === msValue) continue
      if (!sourceIds.has(enValue)) continue
      if (lookup.has(enValue)) continue

      lookup.set(enValue, {
        value: msValue,
        sourcePath: `dolibarr/htdocs/langs/ms_MY/${file.name}`,
      })

      if (lookup.size >= sourceIds.size) break
    }
  }

  return {
    lookup,
    fetchedUrls: [...new Set(fetchedUrls)],
  }
}

async function ingestFrappe(mapping: KeyMapping): Promise<CorpusFile> {
  const entries: CorpusEntry[] = []
  const fetchedUrls: string[] = []
  const now = new Date().toISOString()

  const frappeMappings = mapping.mappings.filter((m) => m.frappe)
  const frappeSourceIds = new Set(frappeMappings.map((m) => m.frappe!.sourceId))
  const dolibarrMsLookupPromise = loadDolibarrMalayLookup(frappeSourceIds)

  // English: use sourceId from mapping (the canonical English msgid)
  for (const m of frappeMappings) {
    entries.push({
      afendaKey: m.afendaKey,
      locale: 'en',
      sourcePath: `frappe/locale/main.pot + erpnext/locale/main.pot`,
      value: m.frappe!.sourceId,
    })
  }

  // Fetch and verify against main.pot to confirm sourceIds exist upstream
  const frappePotUrl = `${FRAPPE_BASE}/main.pot`
  const erpnextPotUrl = `${ERPNEXT_BASE}/main.pot`
  const [frappePot, erpnextPot] = await Promise.all([
    fetchText(frappePotUrl),
    fetchText(erpnextPotUrl),
  ])

  if (frappePot) fetchedUrls.push(frappePotUrl)
  if (erpnextPot) fetchedUrls.push(erpnextPotUrl)

  const frappePotLookup = frappePot
    ? buildPoLookup(frappePot)
    : new Map<string, string>()
  const erpnextPotLookup = erpnextPot
    ? buildPoLookup(erpnextPot)
    : new Map<string, string>()

  // Log which sourceIds were verified in upstream POT files
  let verified = 0
  for (const m of frappeMappings) {
    const sid = m.frappe!.sourceId
    if (frappePotLookup.has(sid) || erpnextPotLookup.has(sid)) {
      verified++
    }
  }
  console.log(
    `  Frappe POT verification: ${verified}/${frappeMappings.length} sourceIds found upstream`,
  )

  // Non-English: fetch locale PO files and look up translations
  for (const locale of SUPPORTED_LOCALES) {
    if (locale === 'en') continue

    const frappePoUrl = `${FRAPPE_BASE}/${locale}.po`
    const erpnextPoUrl = `${ERPNEXT_BASE}/${locale}.po`

    const [frappePo, erpnextPo] = await Promise.all([
      fetchText(frappePoUrl),
      fetchText(erpnextPoUrl),
    ])

    if (frappePo) fetchedUrls.push(frappePoUrl)
    if (erpnextPo) fetchedUrls.push(erpnextPoUrl)

    const frappePoLookup = frappePo
      ? buildPoLookup(frappePo)
      : new Map<string, string>()
    const erpnextPoLookup = erpnextPo
      ? buildPoLookup(erpnextPo)
      : new Map<string, string>()

    const dolibarrMs =
      locale === 'ms'
        ? await dolibarrMsLookupPromise
        : { lookup: new Map<string, DolibarrMsCandidate>(), fetchedUrls: [] }

    if (locale === 'ms') {
      fetchedUrls.push(...dolibarrMs.fetchedUrls)
      console.log(
        `  Dolibarr ms fallback candidates: ${dolibarrMs.lookup.size}/${frappeMappings.length} sourceIds`,
      )
    }

    for (const m of frappeMappings) {
      const sourceId = m.frappe!.sourceId
      const translated =
        erpnextPoLookup.get(sourceId) ?? frappePoLookup.get(sourceId)

      if (translated && translated !== sourceId) {
        entries.push({
          afendaKey: m.afendaKey,
          locale,
          sourcePath: erpnextPoLookup.has(sourceId)
            ? `erpnext/locale/${locale}.po`
            : `frappe/locale/${locale}.po`,
          value: translated,
        })
      } else if (locale === 'ms') {
        const fallback = dolibarrMs.lookup.get(sourceId)
        if (fallback) {
          entries.push({
            afendaKey: m.afendaKey,
            locale,
            sourcePath: fallback.sourcePath,
            value: fallback.value,
          })
        }
      }
    }
  }

  return {
    version: 2,
    source: 'frappe',
    generatedAt: now,
    fetchedFrom: [...new Set(fetchedUrls)],
    entries: entries.sort(
      (a, b) =>
        a.afendaKey.localeCompare(b.afendaKey) ||
        a.locale.localeCompare(b.locale),
    ),
  }
}

async function ingestOdoo(mapping: KeyMapping): Promise<CorpusFile> {
  const entries: CorpusEntry[] = []
  const fetchedUrls: string[] = []
  const now = new Date().toISOString()

  const odooMappings = mapping.mappings.filter((m) => m.odoo)
  const addonsTouched = [...new Set(odooMappings.map((m) => m.odoo!.addon))]

  for (const locale of SUPPORTED_LOCALES) {
    const isEnglish = locale === 'en'

    for (const addon of addonsTouched) {
      let url: string
      if (isEnglish) {
        url = `${ODOO_BASE}/${addon}/i18n/${addon}.pot`
      } else {
        url = `${ODOO_BASE}/${addon}/i18n/${locale}.po`
      }

      const content = await fetchText(url)
      if (!content) continue
      fetchedUrls.push(url)

      const lookup = buildPoLookup(content)

      for (const m of odooMappings) {
        if (m.odoo!.addon !== addon) continue
        const sourceId = m.odoo!.sourceId

        if (isEnglish) {
          if (lookup.has(sourceId)) {
            entries.push({
              afendaKey: m.afendaKey,
              locale: 'en',
              sourcePath: `odoo/addons/${addon}/i18n/${addon}.pot`,
              value: sourceId,
            })
          }
        } else {
          const translated = lookup.get(sourceId)
          if (translated && translated !== sourceId) {
            entries.push({
              afendaKey: m.afendaKey,
              locale,
              sourcePath: `odoo/addons/${addon}/i18n/${locale}.po`,
              value: translated,
            })
          }
        }
      }
    }
  }

  return {
    version: 2,
    source: 'odoo',
    generatedAt: now,
    fetchedFrom: [...new Set(fetchedUrls)],
    entries: entries.sort(
      (a, b) =>
        a.afendaKey.localeCompare(b.afendaKey) ||
        a.locale.localeCompare(b.locale),
    ),
  }
}

async function main(): Promise<void> {
  const mappingPath = join(dataDir, 'i18n-key-mapping.json')
  const mapping = JSON.parse(readFileSync(mappingPath, 'utf8')) as KeyMapping

  console.log(`Loaded ${mapping.mappings.length} key mappings.`)
  console.log(
    'Fetching translation corpora (Tolgee primary + Frappe/Odoo references)...\n',
  )

  const [tolgeeCorpus, frappeCorpus, odooCorpus] = await Promise.all([
    ingestTolgee(),
    ingestFrappe(mapping),
    ingestOdoo(mapping),
  ])

  const tolgeeOutPath = join(dataDir, 'i18n-corpus-tolgee.json')
  const frappeOutPath = join(dataDir, 'i18n-corpus-frappe.json')
  const odooOutPath = join(dataDir, 'i18n-corpus-odoo.json')

  writeFileSync(
    tolgeeOutPath,
    `${JSON.stringify(tolgeeCorpus, null, 2)}\n`,
    'utf8',
  )
  writeFileSync(
    frappeOutPath,
    `${JSON.stringify(frappeCorpus, null, 2)}\n`,
    'utf8',
  )
  writeFileSync(odooOutPath, `${JSON.stringify(odooCorpus, null, 2)}\n`, 'utf8')

  console.log(
    `Tolgee corpus: ${tolgeeCorpus.entries.length} entries from ${tolgeeCorpus.fetchedFrom.length} source(s)`,
  )
  console.log(
    `\nFrappe corpus: ${frappeCorpus.entries.length} entries from ${frappeCorpus.fetchedFrom.length} remote files`,
  )
  console.log(
    `Odoo corpus:   ${odooCorpus.entries.length} entries from ${odooCorpus.fetchedFrom.length} remote files`,
  )
  console.log(`\nWrote: ${tolgeeOutPath}`)
  console.log(`\nWrote: ${frappeOutPath}`)
  console.log(`Wrote: ${odooOutPath}`)
}

main().catch((err) => {
  console.error('Corpus ingestion failed:', err)
  process.exit(1)
})
