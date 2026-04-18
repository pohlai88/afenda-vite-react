"use client"

import { Badge } from "@afenda/design-system/ui-primitives"
import { useTranslation } from "react-i18next"

import { shortContentHash } from "../utils/db-studio-utils"

export type SnapshotMeta = {
  readonly generated_at?: string
  readonly source_commit?: string | null
  readonly source_content_sha256?: string
  readonly document_kind?: string
}

export function DbStudioMetaStrip(props: {
  readonly glossary: SnapshotMeta | null
  readonly truth: SnapshotMeta | null
}) {
  const { t } = useTranslation("shell")
  const { glossary, truth } = props

  return (
    <div
      className="grid gap-3 sm:grid-cols-2"
      aria-label={t("db_studio.meta_strip_aria")}
    >
      <MetaCard title={t("db_studio.meta_glossary_title")} meta={glossary} />
      <MetaCard title={t("db_studio.meta_truth_title")} meta={truth} />
    </div>
  )
}

function MetaCard(props: {
  readonly title: string
  readonly meta: SnapshotMeta | null
}) {
  const { t } = useTranslation("shell")
  const { title, meta } = props

  if (!meta?.generated_at) {
    return (
      <div className="rounded-lg border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
        {title} — {t("db_studio.meta_unavailable")}
      </div>
    )
  }

  return (
    <div className="rounded-lg border bg-card px-3 py-2 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-medium">{title}</span>
        <Badge variant="secondary" className="font-mono text-[0.65rem]">
          {meta.document_kind ?? "—"}
        </Badge>
      </div>
      <dl className="mt-2 grid gap-1 text-xs text-muted-foreground">
        <div className="flex justify-between gap-2">
          <dt>{t("db_studio.meta_generated")}</dt>
          <dd className="font-mono text-[0.7rem]">{meta.generated_at}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt>{t("db_studio.meta_commit")}</dt>
          <dd className="font-mono text-[0.7rem]">
            {meta.source_commit ?? "—"}
          </dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt>{t("db_studio.meta_content_hash")}</dt>
          <dd className="font-mono text-[0.7rem]">
            {shortContentHash(meta.source_content_sha256)}
          </dd>
        </div>
      </dl>
    </div>
  )
}
