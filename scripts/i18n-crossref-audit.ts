/**
 * Cross-reference audit: glossary (Afenda truth) vs Frappe/Odoo candidate corpora.
 * Writes:
 *   - `apps/web/src/share/i18n/audit/conflicts.json` — deterministic conflict statuses
 *   - `apps/web/src/share/i18n/audit/provenance.json`  — import provenance trail
 *
 * Run: pnpm run script:i18n-crossref-audit
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(__dirname, '..')
const i18nRoot = join(repoRoot, 'apps/web/src/share/i18n')
const glossaryPath = join(i18nRoot, 'glossary/canonical-terms.json')
const conflictsPath = join(i18nRoot, 'audit/conflicts.json')
const provenancePath = join(i18nRoot, 'audit/provenance.json')
const decisionsPath = join(i18nRoot, 'glossary/decisions.json')
const tolgeeGeneratedPath = join(
  repoRoot,
  'scripts/data/i18n-corpus-tolgee.json',
)
const frappeGeneratedPath = join(
  repoRoot,
  'scripts/data/i18n-corpus-frappe.json',
)
const frappeFallbackPath = join(
  repoRoot,
  'scripts/data/i18n-corpus-frappe.sample.json',
)
const odooGeneratedPath = join(repoRoot, 'scripts/data/i18n-corpus-odoo.json')
const odooFallbackPath = join(
  repoRoot,
  'scripts/data/i18n-corpus-odoo.sample.json',
)

type GlossaryFile = {
  version: number
  terms: Array<{
    id: string
    canonicalKey: string
    en: string
    category?: string
    notes?: string
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
  entries: CorpusEntry[]
}

type ConflictStatus = 'accepted' | 'review' | 'rejected'

type ConflictItem = {
  afendaKey: string
  status: ConflictStatus
  resolutionSource:
    | 'glossary'
    | 'corpus_consensus'
    | 'corpus_conflict'
    | 'platform_conflict'
    | 'manual'
    | 'non_glossary'
  tolgeeCandidate?: string
  frappeCandidate?: string
  odooCandidate?: string
  glossaryValue?: string
  notes?: string
}

type DecisionsFile = {
  version: number
  decisions: Array<{
    id: string
    canonicalKey: string
    action: string
    resolvedValue: string
  }>
}

type ProvenanceEntry = {
  afendaKey: string
  sourceSystem: 'tolgee' | 'frappe' | 'odoo'
  sourceTier: 'primary' | 'reference'
  sourceLocale: string
  sourcePath: string
  importTimestamp: string
  candidateValue: string
  decisionStatus: ConflictStatus
}

function loadJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf8')) as T
}

function safeLoad(path: string): CorpusFile | null {
  try {
    return loadJson<CorpusFile>(path)
  } catch {
    return null
  }
}

function main(): void {
  const glossary = loadJson<GlossaryFile>(glossaryPath)
  const decisions = loadJson<DecisionsFile>(decisionsPath)
  const tolgee = safeLoad(tolgeeGeneratedPath)

  const frappe = safeLoad(frappeGeneratedPath) ?? safeLoad(frappeFallbackPath)
  const odoo = safeLoad(odooGeneratedPath) ?? safeLoad(odooFallbackPath)
  if (!tolgee) {
    throw new Error(
      `Missing primary Tolgee corpus at ${tolgeeGeneratedPath}. Run "pnpm run script:i18n-corpus-ingest" first.`,
    )
  }

  const tolgeeSource = safeLoad(tolgeeGeneratedPath) ? 'generated' : 'none'
  const frappeSource = frappe
    ? safeLoad(frappeGeneratedPath)
      ? 'generated'
      : 'fallback (sample)'
    : 'none'
  const odooSource = odoo
    ? safeLoad(odooGeneratedPath)
      ? 'generated'
      : 'fallback (sample)'
    : 'none'
  console.log(
    `Tolgee corpus: ${tolgeeSource}, Frappe corpus: ${frappeSource}, Odoo corpus: ${odooSource}`,
  )

  const decisionByKey = new Map(
    decisions.decisions.map((d) => [d.canonicalKey, d]),
  )

  const items: ConflictItem[] = []
  const provenance: ProvenanceEntry[] = []
  const now = new Date().toISOString()

  const allCorpusKeys = new Set<string>()
  for (const e of tolgee.entries) allCorpusKeys.add(e.afendaKey)
  if (frappe) for (const e of frappe.entries) allCorpusKeys.add(e.afendaKey)
  if (odoo) for (const e of odoo.entries) allCorpusKeys.add(e.afendaKey)

  const glossaryByKey = new Map(glossary.terms.map((t) => [t.canonicalKey, t]))

  for (const term of glossary.terms) {
    const key = term.canonicalKey
    const tgEntries = tolgee.entries.filter((e) => e.afendaKey === key)
    const frEntries = frappe?.entries.filter((e) => e.afendaKey === key) ?? []
    const odEntries = odoo?.entries.filter((e) => e.afendaKey === key) ?? []

    const tg = tgEntries.find((e) => e.locale === 'en')
    const fr = frEntries.find((e) => e.locale === 'en')
    const od = odEntries.find((e) => e.locale === 'en')
    const tgVal = tg?.value
    const frVal = fr?.value
    const odVal = od?.value

    for (const entry of tgEntries) {
      provenance.push({
        afendaKey: key,
        sourceSystem: 'tolgee',
        sourceTier: 'primary',
        sourceLocale: entry.locale,
        sourcePath: entry.sourcePath,
        importTimestamp: now,
        candidateValue: entry.value,
        decisionStatus: 'accepted',
      })
    }
    for (const entry of frEntries) {
      provenance.push({
        afendaKey: key,
        sourceSystem: 'frappe',
        sourceTier: 'reference',
        sourceLocale: entry.locale,
        sourcePath: entry.sourcePath,
        importTimestamp: now,
        candidateValue: entry.value,
        decisionStatus: 'accepted',
      })
    }
    for (const entry of odEntries) {
      provenance.push({
        afendaKey: key,
        sourceSystem: 'odoo',
        sourceTier: 'reference',
        sourceLocale: entry.locale,
        sourcePath: entry.sourcePath,
        importTimestamp: now,
        candidateValue: entry.value,
        decisionStatus: 'accepted',
      })
    }

    if (!tgVal) {
      items.push({
        afendaKey: key,
        status: 'review',
        resolutionSource: 'manual',
        tolgeeCandidate: tgVal,
        frappeCandidate: frVal,
        odooCandidate: odVal,
        glossaryValue: term.en,
        notes:
          'Primary platform (Tolgee) missing English candidate for canonical key.',
      })
      continue
    }

    if (tgVal === term.en) {
      items.push({
        afendaKey: key,
        status: 'accepted',
        resolutionSource: 'corpus_consensus',
        tolgeeCandidate: tgVal,
        frappeCandidate: frVal,
        odooCandidate: odVal,
        glossaryValue: term.en,
        notes: 'Primary platform matches glossary canonical English value.',
      })
      continue
    }

    if (tgVal !== term.en) {
      const decision = decisionByKey.get(key)
      items.push({
        afendaKey: key,
        status: 'review',
        resolutionSource: 'platform_conflict',
        tolgeeCandidate: tgVal,
        frappeCandidate: frVal,
        odooCandidate: odVal,
        glossaryValue: term.en,
        notes: decision
          ? `Tolgee candidate "${tgVal}" conflicts with glossary "${term.en}" (decision ${decision.id}: "${decision.resolvedValue}").`
          : `Tolgee candidate "${tgVal}" conflicts with glossary "${term.en}".`,
      })
      continue
    }
  }

  for (const corpusKey of allCorpusKeys) {
    if (glossaryByKey.has(corpusKey)) continue
    const tg = tolgee.entries.find(
      (e) => e.afendaKey === corpusKey && e.locale === 'en',
    )
    const fr = frappe?.entries.find(
      (e) => e.afendaKey === corpusKey && e.locale === 'en',
    )
    const od = odoo?.entries.find(
      (e) => e.afendaKey === corpusKey && e.locale === 'en',
    )
    items.push({
      afendaKey: corpusKey,
      status: 'accepted',
      resolutionSource: 'non_glossary',
      tolgeeCandidate: tg?.value,
      frappeCandidate: fr?.value,
      odooCandidate: od?.value,
      notes:
        'Corpus key is outside glossary-authority scope; tracked as non-glossary.',
    })

    if (tg) {
      provenance.push({
        afendaKey: corpusKey,
        sourceSystem: 'tolgee',
        sourceTier: 'primary',
        sourceLocale: tg.locale,
        sourcePath: tg.sourcePath,
        importTimestamp: now,
        candidateValue: tg.value,
        decisionStatus: 'accepted',
      })
    }
    if (fr) {
      provenance.push({
        afendaKey: corpusKey,
        sourceSystem: 'frappe',
        sourceTier: 'reference',
        sourceLocale: fr.locale,
        sourcePath: fr.sourcePath,
        importTimestamp: now,
        candidateValue: fr.value,
        decisionStatus: 'review',
      })
    }
    if (od) {
      provenance.push({
        afendaKey: corpusKey,
        sourceSystem: 'odoo',
        sourceTier: 'reference',
        sourceLocale: od.locale,
        sourcePath: od.sourcePath,
        importTimestamp: now,
        candidateValue: od.value,
        decisionStatus: 'review',
      })
    }
  }

  const conflictsOut = {
    version: 2,
    generatedAt: now,
    items: items.sort((a, b) => a.afendaKey.localeCompare(b.afendaKey)),
  }

  const provenanceOut = {
    version: 2,
    generatedAt: now,
    entries: provenance.sort(
      (a, b) =>
        a.afendaKey.localeCompare(b.afendaKey) ||
        a.sourceSystem.localeCompare(b.sourceSystem),
    ),
  }

  writeFileSync(
    conflictsPath,
    `${JSON.stringify(conflictsOut, null, 2)}\n`,
    'utf8',
  )
  writeFileSync(
    provenancePath,
    `${JSON.stringify(provenanceOut, null, 2)}\n`,
    'utf8',
  )

  const accepted = items.filter((i) => i.status === 'accepted').length
  const review = items.filter((i) => i.status === 'review').length
  const rejected = items.filter((i) => i.status === 'rejected').length
  console.log(`Wrote ${items.length} audit row(s) to ${conflictsPath}`)
  console.log(
    `  accepted: ${accepted}, review: ${review}, rejected: ${rejected}`,
  )
  console.log(
    `Wrote ${provenance.length} provenance entries to ${provenancePath}`,
  )
}

main()
