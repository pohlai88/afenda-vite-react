/**
 * DB Studio — read-only catalog UI aligned with conceptual / governance / logical / physical / evidence layers.
 * Domain-module matrix is derived from the glossary snapshot (no separate matrix HTTP call).
 * @see packages/_database/docs/STUDIO_MODELING.md
 */
"use client"

import { useQuery } from "@tanstack/react-query"
import {
  memo,
  useDeferredValue,
  useMemo,
  useState,
} from "react"
import { useTranslation } from "react-i18next"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@afenda/design-system/ui-primitives"
import {
  getSharedApiClient,
  resolveApiV1Path,
} from "../../_platform/api-client"
import { useOptionalTenantIdHeaders } from "../../_platform/tenant/tenant-scope-context"
import type { BusinessGlossaryEntry } from "@afenda/database/studio/snapshots"

import { DbStudioLayerNav } from "./db-studio-layer-nav"
import { DbStudioMetaStrip } from "./db-studio-meta-strip"
import {
  DB_STUDIO_GLOSSARY_STALE_MS,
  fetchStudioGlossary,
  fetchStudioTruthGovernance,
  studioQueryKeys,
} from "./db-studio-queries"
import {
  DbStudioTruthPanel,
  type TruthGovernanceDoc,
} from "./db-studio-truth-panel"
import {
  buildDomainModuleEntryCounts,
  formatGlossaryTechnicalSummary,
} from "./db-studio-utils"

type EnumRow = {
  readonly schema_name: string
  readonly enum_name: string
  readonly value: string
  readonly sort_order: number
}

type EnumsResponse = {
  readonly enums: ReadonlyArray<EnumRow>
}

type AuditRecentResponse = {
  readonly items: ReadonlyArray<Record<string, unknown>>
  readonly tenantId: string
  readonly limit: number
}

function useStudioGlossary() {
  return useQuery({
    queryKey: studioQueryKeys.glossary,
    staleTime: DB_STUDIO_GLOSSARY_STALE_MS,
    gcTime: DB_STUDIO_GLOSSARY_STALE_MS * 2,
    queryFn: fetchStudioGlossary,
  })
}

function useStudioEnums() {
  return useQuery({
    queryKey: studioQueryKeys.enums,
    staleTime: DB_STUDIO_GLOSSARY_STALE_MS,
    gcTime: DB_STUDIO_GLOSSARY_STALE_MS * 2,
    queryFn: async () => {
      const client = getSharedApiClient()
      return client.get<EnumsResponse>(resolveApiV1Path("/studio/enums"))
    },
  })
}

function useStudioTruthGovernance() {
  return useQuery({
    queryKey: studioQueryKeys.truthGovernance,
    staleTime: DB_STUDIO_GLOSSARY_STALE_MS,
    gcTime: DB_STUDIO_GLOSSARY_STALE_MS * 2,
    queryFn: fetchStudioTruthGovernance,
  })
}

function useStudioAuditRecent(tenantHeaders: Record<string, string>) {
  const enabled = Boolean(tenantHeaders["X-Tenant-Id"])
  return useQuery({
    queryKey: ["studio", "audit", "recent", tenantHeaders["X-Tenant-Id"] ?? ""],
    enabled,
    staleTime: 60_000,
    queryFn: async () => {
      const client = getSharedApiClient()
      return client.get<AuditRecentResponse>(
        resolveApiV1Path("/studio/audit/recent?limit=30"),
        { headers: tenantHeaders }
      )
    },
  })
}

const GlossaryEntryRow = memo(function GlossaryEntryRow(props: {
  readonly entry: BusinessGlossaryEntry
}) {
  const { entry: e } = props
  return (
    <li
      className="px-3 py-2.5 text-sm [content-visibility:auto]"
      style={{ containIntrinsicSize: "auto 4.5rem" }}
    >
      <div className="font-medium leading-snug">{e.business_primary_term}</div>
      <div className="text-muted-foreground mt-0.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-xs">
        <span className="font-mono">{e.id}</span>
        <span aria-hidden>·</span>
        <span>{e.domain_module}</span>
      </div>
      <div className="text-muted-foreground mt-1 font-mono text-[0.7rem]">
        {formatGlossaryTechnicalSummary(e.technical)}
      </div>
    </li>
  )
})

function CatalogLoadingSkeleton() {
  return (
    <div className="space-y-3" aria-hidden>
      <Skeleton className="h-9 max-w-md rounded-md" />
      <div className="space-y-2">
        <Skeleton className="h-14 w-full rounded-md" />
        <Skeleton className="h-14 w-full rounded-md" />
        <Skeleton className="h-14 w-full rounded-md" />
      </div>
    </div>
  )
}

export function DbStudioPage() {
  const { t } = useTranslation("shell")
  const tenantHeaders = useOptionalTenantIdHeaders()
  const glossaryQ = useStudioGlossary()
  const enumsQ = useStudioEnums()
  const truthQ = useStudioTruthGovernance()
  const auditQ = useStudioAuditRecent(tenantHeaders)

  const [query, setQuery] = useState("")
  const deferredQuery = useDeferredValue(query)

  const filteredEntries = useMemo(() => {
    const doc = glossaryQ.data
    if (!doc) return []
    const q = deferredQuery.trim().toLowerCase()
    if (!q) return [...doc.entries]
    return doc.entries.filter((e) => {
      const hay = [
        e.id,
        e.business_primary_term,
        e.domain_module,
        ...(e.aliases ?? []),
      ]
        .join(" ")
        .toLowerCase()
      return hay.includes(q)
    })
  }, [glossaryQ.data, deferredQuery])

  const domainModuleMatrix = useMemo(() => {
    const doc = glossaryQ.data
    if (!doc) return null
    return {
      domain_modules: doc.domain_modules,
      entry_counts_by_domain_module: buildDomainModuleEntryCounts(
        doc.entries
      ),
    }
  }, [glossaryQ.data])

  const enumsByName = useMemo(() => {
    const list = enumsQ.data?.enums ?? []
    const map = new Map<string, EnumRow[]>()
    for (const row of list) {
      const k = row.enum_name
      const cur = map.get(k)
      if (cur) {
        cur.push(row)
      } else {
        map.set(k, [row])
      }
    }
    return map
  }, [enumsQ.data])

  const glossaryMeta = glossaryQ.data
    ? {
        generated_at: glossaryQ.data.generated_at,
        source_commit: glossaryQ.data.source_commit,
        source_content_sha256: glossaryQ.data.source_content_sha256,
        document_kind: glossaryQ.data.document_kind,
      }
    : null

  const truthMeta = truthQ.data
    ? {
        generated_at: truthQ.data.generated_at,
        source_commit: truthQ.data.source_commit,
        source_content_sha256: truthQ.data.source_content_sha256,
        document_kind: truthQ.data.document_kind,
      }
    : null

  const truthDoc: TruthGovernanceDoc | null = truthQ.data
    ? {
        description: truthQ.data.description,
        truth_classes: truthQ.data.truth_classes,
        scope_models: truthQ.data.scope_models,
        time_models: truthQ.data.time_models,
        artifact_bindings: truthQ.data.artifact_bindings,
      }
    : null

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("db_studio.title")}
        </h1>
        <p className="text-muted-foreground max-w-prose text-sm leading-relaxed">
          {t("db_studio.description")}
        </p>
      </header>

      <DbStudioMetaStrip glossary={glossaryMeta} truth={truthMeta} />

      <DbStudioLayerNav />

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <Card
          id="db-studio-catalog"
          className="scroll-mt-24 min-h-[280px] lg:min-h-[360px]"
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">
              {t("db_studio.glossary_heading")}
            </CardTitle>
            <CardDescription>
              {t("db_studio.glossary_card_description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="flex max-w-md flex-col gap-1 text-sm">
              <span className="text-muted-foreground" id="db-studio-glossary-search-label">
                {t("db_studio.search_label")}
              </span>
              <input
                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm focus-visible:ring-2 focus-visible:outline-none"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                type="search"
                autoComplete="off"
                spellCheck={false}
                aria-labelledby="db-studio-glossary-search-label"
              />
            </label>
            {glossaryQ.isPending ? (
              <CatalogLoadingSkeleton />
            ) : glossaryQ.isError ? (
              <p className="text-destructive text-sm" role="alert">
                {t("db_studio.error")}
              </p>
            ) : (
              <ul
                className="divide-border border-border max-h-[min(24rem,50vh)] divide-y overflow-y-auto rounded-md border"
                aria-label={t("db_studio.glossary_heading")}
              >
                {filteredEntries.map((e) => (
                  <GlossaryEntryRow key={e.id} entry={e} />
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <div id="db-studio-governance" className="scroll-mt-24">
          {truthQ.isPending ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48 rounded-md" />
                <Skeleton className="h-10 w-full max-w-prose rounded-md" />
              </CardHeader>
              <CardContent className="space-y-3" aria-hidden>
                <Skeleton className="h-32 w-full rounded-lg" />
              </CardContent>
            </Card>
          ) : truthQ.isError ? (
            <Card>
              <CardContent className="text-destructive py-10 text-sm">
                {t("db_studio.error")}
              </CardContent>
            </Card>
          ) : truthDoc ? (
            <DbStudioTruthPanel doc={truthDoc} />
          ) : null}
        </div>
      </div>

      <Card id="db-studio-logical" className="scroll-mt-24">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{t("db_studio.matrix_heading")}</CardTitle>
          <CardDescription>
            {t("db_studio.matrix_card_description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {glossaryQ.isPending ? (
            <div className="max-w-xl space-y-2" aria-hidden>
              <Skeleton className="h-8 w-full rounded-md" />
              <Skeleton className="h-8 w-full rounded-md" />
              <Skeleton className="h-8 w-full rounded-md" />
            </div>
          ) : glossaryQ.isError ? (
            <p className="text-destructive text-sm">{t("db_studio.error")}</p>
          ) : domainModuleMatrix ? (
            <div className="max-w-xl overflow-x-auto">
              <Table aria-label={t("db_studio.matrix_heading")}>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[70%]">
                      {t("db_studio.matrix_class")}
                    </TableHead>
                    <TableHead className="text-end tabular-nums">
                      {t("db_studio.matrix_count")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {domainModuleMatrix.domain_modules.map((sc) => (
                    <TableRow key={sc.id}>
                      <TableCell>{sc.label}</TableCell>
                      <TableCell className="text-end tabular-nums">
                        {domainModuleMatrix.entry_counts_by_domain_module[
                          sc.id
                        ] ?? 0}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card id="db-studio-physical" className="scroll-mt-24">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{t("db_studio.enums_heading")}</CardTitle>
          <CardDescription>
            {t("db_studio.enums_card_description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {enumsQ.isPending ? (
            <div className="space-y-3" aria-hidden>
              <Skeleton className="h-6 w-40 rounded-md" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-16 rounded-md" />
                <Skeleton className="h-6 w-20 rounded-md" />
                <Skeleton className="h-6 w-14 rounded-md" />
              </div>
            </div>
          ) : enumsQ.isError ? (
            <p className="text-destructive text-sm">{t("db_studio.error")}</p>
          ) : (
            <div className="space-y-4">
              {[...enumsByName.entries()].map(([name, rows]) => (
                <section key={name} aria-labelledby={`enum-group-${name}`}>
                  <h3 id={`enum-group-${name}`} className="text-sm font-medium">
                    {name}
                  </h3>
                  <ul
                    className="text-muted-foreground mt-1 flex flex-wrap gap-1.5 text-xs"
                    aria-label={name}
                  >
                    {rows.map((r) => (
                      <li
                        key={`${r.enum_name}-${r.value}-${r.sort_order}`}
                        className="bg-muted rounded-md px-2 py-0.5 font-mono"
                      >
                        {r.value}
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card id="db-studio-evidence" className="scroll-mt-24">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{t("db_studio.audit_heading")}</CardTitle>
          <CardDescription>{t("db_studio.audit_card_description")}</CardDescription>
        </CardHeader>
        <CardContent>
          {!tenantHeaders["X-Tenant-Id"] ? (
            <p className="text-muted-foreground text-sm">
              {t("db_studio.audit_need_tenant")}
            </p>
          ) : auditQ.isPending ? (
            <div className="space-y-2" aria-hidden>
              <Skeleton className="h-12 w-full rounded-md" />
              <Skeleton className="h-12 w-full rounded-md" />
              <Skeleton className="h-12 w-full rounded-md" />
            </div>
          ) : auditQ.isError ? (
            <p className="text-destructive text-sm">{t("db_studio.error")}</p>
          ) : (
            <ul
              className="divide-border border-border max-h-96 divide-y overflow-y-auto rounded-md border text-sm"
              aria-label={t("db_studio.audit_heading")}
            >
              {(auditQ.data?.items ?? []).map((row) => (
                <li key={String(row.id)} className="px-3 py-2">
                  <div className="font-mono text-xs">
                    {String(row.action ?? "")} · {String(row.outcome ?? "")}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {String(row.recordedAt ?? "")}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
