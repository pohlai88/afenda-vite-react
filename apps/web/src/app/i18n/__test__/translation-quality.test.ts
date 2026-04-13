import { describe, expect, test } from 'vitest'

import enAllocation from '../locales/en/allocation.json'
import enAuth from '../locales/en/auth.json'
import enDashboard from '../locales/en/dashboard.json'
import enGlossary from '../locales/en/glossary.json'
import enInvoice from '../locales/en/invoice.json'
import enSettlement from '../locales/en/settlement.json'
import enShell from '../locales/en/shell.json'
import idAllocation from '../locales/id/allocation.json'
import idAuth from '../locales/id/auth.json'
import idDashboard from '../locales/id/dashboard.json'
import idGlossary from '../locales/id/glossary.json'
import idInvoice from '../locales/id/invoice.json'
import idSettlement from '../locales/id/settlement.json'
import idShell from '../locales/id/shell.json'
import msAllocation from '../locales/ms/allocation.json'
import msAuth from '../locales/ms/auth.json'
import msDashboard from '../locales/ms/dashboard.json'
import msGlossary from '../locales/ms/glossary.json'
import msInvoice from '../locales/ms/invoice.json'
import msSettlement from '../locales/ms/settlement.json'
import msShell from '../locales/ms/shell.json'
import viAllocation from '../locales/vi/allocation.json'
import viAuth from '../locales/vi/auth.json'
import viDashboard from '../locales/vi/dashboard.json'
import viGlossary from '../locales/vi/glossary.json'
import viInvoice from '../locales/vi/invoice.json'
import viSettlement from '../locales/vi/settlement.json'
import viShell from '../locales/vi/shell.json'
import {
  ALL_NAMESPACES,
  SUPPORTED_LOCALES,
  type SupportedLocale,
  type TranslationNamespace,
} from '../policy'

type FlatMap = Record<string, string>

const RESOURCE_BY_LOCALE = {
  en: {
    shell: enShell,
    auth: enAuth,
    dashboard: enDashboard,
    invoice: enInvoice,
    allocation: enAllocation,
    settlement: enSettlement,
    glossary: enGlossary,
  },
  ms: {
    shell: msShell,
    auth: msAuth,
    dashboard: msDashboard,
    invoice: msInvoice,
    allocation: msAllocation,
    settlement: msSettlement,
    glossary: msGlossary,
  },
  id: {
    shell: idShell,
    auth: idAuth,
    dashboard: idDashboard,
    invoice: idInvoice,
    allocation: idAllocation,
    settlement: idSettlement,
    glossary: idGlossary,
  },
  vi: {
    shell: viShell,
    auth: viAuth,
    dashboard: viDashboard,
    invoice: viInvoice,
    allocation: viAllocation,
    settlement: viSettlement,
    glossary: viGlossary,
  },
} as const satisfies Record<
  SupportedLocale,
  Record<TranslationNamespace, unknown>
>

function flattenLeaves(obj: unknown, prefix = ''): FlatMap {
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
    return {}
  }

  const out: FlatMap = {}

  for (const [k, v] of Object.entries(obj)) {
    const next = prefix ? `${prefix}.${k}` : k

    if (typeof v === 'string') {
      out[next] = v
      continue
    }

    Object.assign(out, flattenLeaves(v, next))
  }

  return out
}

function extractInterpolationTokens(value: string): string[] {
  const tokens = [...value.matchAll(/\{\{\s*([^{}\s]+)\s*\}\}/g)].map(
    (match) => match[1],
  )

  return [...new Set(tokens)].sort()
}

describe('translation quality', () => {
  test('non-en locales preserve interpolation tokens from canonical English', () => {
    const errors: string[] = []

    for (const namespace of ALL_NAMESPACES) {
      const canonicalFlat = flattenLeaves(RESOURCE_BY_LOCALE.en[namespace])

      for (const locale of SUPPORTED_LOCALES) {
        if (locale === 'en') {
          continue
        }

        const localeFlat = flattenLeaves(RESOURCE_BY_LOCALE[locale][namespace])

        for (const [leafKey, canonicalValue] of Object.entries(canonicalFlat)) {
          const localeValue = localeFlat[leafKey]

          if (localeValue === undefined) {
            continue
          }

          const canonicalTokens = extractInterpolationTokens(canonicalValue)
          const localeTokens = extractInterpolationTokens(localeValue)

          if (
            canonicalTokens.length !== localeTokens.length ||
            canonicalTokens.some(
              (token, index) => token !== localeTokens[index],
            )
          ) {
            errors.push(
              `${locale}.${namespace}.${leafKey}: expected {${canonicalTokens.join(', ')}} but found {${localeTokens.join(', ')}}`,
            )
          }
        }
      }
    }

    expect(errors).toEqual([])
  })
})
