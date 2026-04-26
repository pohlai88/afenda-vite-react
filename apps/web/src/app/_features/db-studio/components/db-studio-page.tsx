/**
 * DB Studio — read-only catalog UI aligned with conceptual / governance / logical / physical / evidence layers.
 * Domain-module matrix is derived from the glossary snapshot (no separate matrix HTTP call).
 * @see packages/_database/src/studio (snapshots + enum catalog)
 */
"use client"

import { useQuery } from "@tanstack/react-query"
import { memo, useDeferredValue, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import {
  AppSurface,
  type AppSurfaceContract,
  StateSurface,
} from "@/app/_platform/app-surface"
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
} from "../../../_platform/runtime"
import {
  useOptionalTenantIdHeaders,
  useOptionalTenantScope,
} from "../../../_platform/tenant/tenant-scope-context"
import type {
  BusinessGlossaryEntry,
  StudioPgEnumRow,
} from "@afenda/database/studio/snapshots"

import { DbStudioLayerNav } from "./db-studio-layer-nav"
import { DbStudioMetaStrip } from "./db-studio-meta-strip"
import {
  DB_STUDIO_GLOSSARY_STALE_MS,
  fetchStudioEnums,
  fetchStudioGlossary,
  fetchStudioTruthGovernance,
  studioQueryKeys,
} from "../services/db-studio-queries"
import { DbStudioTruthPanel } from "./db-studio-truth-panel"
import type { TruthGovernanceDoc } from "../types/db-studio"
import {
  buildDomainModuleEntryCounts,
  formatGlossaryTechnicalSummary,
} from "../db-studio-formatters"

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
    queryFn: fetchStudioEnums,
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
    <li className="px-3 py-2.5 text-sm [contain-intrinsic-size:auto_4.5rem] [content-visibility:auto]">
      <div className="leading-snug font-medium">{e.business_primary_term}</div>
      <div className="mt-0.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
        <span className="font-mono">{e.id}</span>
        <span aria-hidden>·</span>
        <span>{e.domain_module}</span>
      </div>
      <div className="mt-1 font-mono text-[0.7rem] text-muted-foreground">
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

function createDbStudioSurfaceContract(input: {
  readonly tenantName?: string
  readonly glossaryGeneratedAt?: string
  readonly truthGeneratedAt?: string
}): AppSurfaceContract {
  return {
    kind: "workspace",
    header: {
      kicker: "DB Studio",
      title: "DB Studio",
      description:
        "Read-only catalogs: business glossary, truth governance overlays, domain coverage, physical enums, and recent tenant audit evidence.",
    },
    metaRow:
      input.tenantName || input.glossaryGeneratedAt || input.truthGeneratedAt
        ? {
            items: [
              ...(input.tenantName
                ? [
                    {
                      id: "tenant",
                      label: "Tenant",
                      value: input.tenantName,
                    },
                  ]
                : []),
              ...(input.glossaryGeneratedAt
                ? [
                    {
                      id: "glossary",
                      label: "Glossary snapshot",
                      value: `Glossary ${input.glossaryGeneratedAt}`,
                    },
                  ]
                : []),
              ...(input.truthGeneratedAt
                ? [
                    {
                      id: "truth",
                      label: "Truth snapshot",
                      value: `Truth ${input.truthGeneratedAt}`,
                    },
                  ]
                : []),
            ],
          }
        : undefined,
    content: {
      sections: [
        { id: "studio-meta" },
        { id: "studio-layer-nav" },
        { id: "studio-catalog-governance" },
        { id: "studio-logical" },
        { id: "studio-physical" },
        { id: "studio-evidence" },
      ],
    },
    stateSurface: {
      loading: {
        title: "Loading DB Studio",
        description:
          "Please wait while Afenda assembles the database governance surfaces.",
      },
      empty: {
        title: "DB Studio unavailable",
        description:
          "This studio surface is available, but no governed catalog content was returned.",
      },
      failure: {
        title: "DB Studio unavailable",
        description:
          "Afenda could not load the database governance surface right now.",
      },
      forbidden: {
        title: "DB Studio unavailable",
        description:
          "You do not have permission to inspect this governed database surface.",
      },
    },
  }
}

export function DbStudioPage() {
  const { t } = useTranslation("shell")
  const tenantHeaders = useOptionalTenantIdHeaders()
  const scope = useOptionalTenantScope()
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
      entry_counts_by_domain_module: buildDomainModuleEntryCounts(doc.entries),
    }
  }, [glossaryQ.data])

  const enumsByName = useMemo(() => {
    const list = enumsQ.data?.enums ?? []
    const map = new Map<string, StudioPgEnumRow[]>()
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

  const tenantName =
    scope?.status === "ready"
      ? (scope.me.tenant?.memberships.find(
          (membership) => membership.tenantId === scope.selectedTenantId
        )?.tenantName ?? scope.me.tenant?.memberships[0]?.tenantName)
      : undefined

  const surfaceContract = createDbStudioSurfaceContract({
    tenantName,
    glossaryGeneratedAt: glossaryMeta?.generated_at,
    truthGeneratedAt: truthMeta?.generated_at,
  })

  const isCoreLoading =
    !glossaryQ.data &&
    !enumsQ.data &&
    !truthQ.data &&
    glossaryQ.isPending &&
    enumsQ.isPending &&
    truthQ.isPending

  const isCoreFailure =
    !glossaryQ.data &&
    !enumsQ.data &&
    !truthQ.data &&
    glossaryQ.isError &&
    enumsQ.isError &&
    truthQ.isError

  if (isCoreLoading) {
    return (
      <StateSurface
        surfaceKind="workspace"
        kind="loading"
        title={surfaceContract.stateSurface.loading.title}
        description={surfaceContract.stateSurface.loading.description}
      />
    )
  }

  if (isCoreFailure) {
    return (
      <StateSurface
        surfaceKind="workspace"
        kind="failure"
        title={surfaceContract.stateSurface.failure.title}
        description={surfaceContract.stateSurface.failure.description}
      />
    )
  }

  return (
    <AppSurface contract={surfaceContract}>
      <DbStudioMetaStrip glossary={glossaryMeta} truth={truthMeta} />

      <DbStudioLayerNav />

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <Card
          id="db-studio-catalog"
          className="min-h-[280px] scroll-mt-24 lg:min-h-[360px]"
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
              <span
                className="text-muted-foreground"
                id="db-studio-glossary-search-label"
              >
                {t("db_studio.search_label")}
              </span>
              <input
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
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
              <p className="text-sm text-destructive" role="alert">
                {t("db_studio.error")}
              </p>
            ) : (
              <ul
                className="max-h-[min(24rem,50vh)] divide-y divide-border overflow-y-auto rounded-md border border-border"
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
              <CardContent className="py-10 text-sm text-destructive">
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
          <CardTitle className="text-lg">
            {t("db_studio.matrix_heading")}
          </CardTitle>
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
            <p className="text-sm text-destructive">{t("db_studio.error")}</p>
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
          <CardTitle className="text-lg">
            {t("db_studio.enums_heading")}
          </CardTitle>
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
            <p className="text-sm text-destructive">{t("db_studio.error")}</p>
          ) : (
            <div className="space-y-4">
              {[...enumsByName.entries()].map(([name, rows]) => (
                <section key={name} aria-labelledby={`enum-group-${name}`}>
                  <h3 id={`enum-group-${name}`} className="text-sm font-medium">
                    {name}
                  </h3>
                  <ul
                    className="mt-1 flex flex-wrap gap-1.5 text-xs text-muted-foreground"
                    aria-label={name}
                  >
                    {rows.map((r) => (
                      <li
                        key={`${r.enum_name}-${r.value}-${r.sort_order}`}
                        className="rounded-md bg-muted px-2 py-0.5 font-mono"
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
          <CardTitle className="text-lg">
            {t("db_studio.audit_heading")}
          </CardTitle>
          <CardDescription>
            {t("db_studio.audit_card_description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!tenantHeaders["X-Tenant-Id"] ? (
            <p className="text-sm text-muted-foreground">
              {t("db_studio.audit_need_tenant")}
            </p>
          ) : auditQ.isPending ? (
            <div className="space-y-2" aria-hidden>
              <Skeleton className="h-12 w-full rounded-md" />
              <Skeleton className="h-12 w-full rounded-md" />
              <Skeleton className="h-12 w-full rounded-md" />
            </div>
          ) : auditQ.isError ? (
            <p className="text-sm text-destructive">{t("db_studio.error")}</p>
          ) : (
            <ul
              className="max-h-96 divide-y divide-border overflow-y-auto rounded-md border border-border text-sm"
              aria-label={t("db_studio.audit_heading")}
            >
              {(auditQ.data?.items ?? []).map((row) => (
                <li key={String(row.id)} className="px-3 py-2">
                  <div className="font-mono text-xs">
                    {String(row.action ?? "")} · {String(row.outcome ?? "")}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {String(row.recordedAt ?? "")}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </AppSurface>
  )
}
