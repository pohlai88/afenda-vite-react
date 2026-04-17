"use client"

import { memo } from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@afenda/design-system/ui-primitives"
import { useTranslation } from "react-i18next"

import type { TruthGovernanceSnapshot } from "@afenda/database/studio/snapshots"

type RegistryRow = {
  readonly id: string
  readonly label: string
  readonly summary?: string
}

export type TruthGovernanceDoc = Pick<
  TruthGovernanceSnapshot,
  | "description"
  | "truth_classes"
  | "scope_models"
  | "time_models"
  | "artifact_bindings"
>

function DbStudioTruthPanelInner(props: { readonly doc: TruthGovernanceDoc }) {
  const { t } = useTranslation("shell")
  const { doc } = props

  const empty =
    doc.truth_classes.length === 0 &&
    doc.scope_models.length === 0 &&
    doc.time_models.length === 0 &&
    doc.artifact_bindings.length === 0

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{t("db_studio.truth_heading")}</CardTitle>
        <CardDescription className="text-pretty max-w-prose">
          {t("db_studio.truth_description")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {doc.description ? (
          <p className="text-muted-foreground text-sm whitespace-pre-wrap">
            {doc.description.trim()}
          </p>
        ) : null}

        {empty ? (
          <p className="text-muted-foreground border-muted-foreground/20 rounded-md border border-dashed px-3 py-6 text-center text-sm">
            {t("db_studio.truth_empty")}
          </p>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <RegistryColumn
                title={t("db_studio.truth_classes_heading")}
                rows={doc.truth_classes}
                emptyHint={t("db_studio.truth_column_empty")}
              />
              <RegistryColumn
                title={t("db_studio.scope_models_heading")}
                rows={doc.scope_models}
                emptyHint={t("db_studio.truth_column_empty")}
              />
              <RegistryColumn
                title={t("db_studio.time_models_heading")}
                rows={doc.time_models}
                emptyHint={t("db_studio.truth_column_empty")}
              />
            </div>

            {doc.artifact_bindings.length > 0 ? (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">
                  {t("db_studio.artifact_bindings_heading")}
                </h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[28%]">
                        {t("db_studio.bindings_col_artifact")}
                      </TableHead>
                      <TableHead>{t("db_studio.bindings_col_truth")}</TableHead>
                      <TableHead>{t("db_studio.bindings_col_scope")}</TableHead>
                      <TableHead>{t("db_studio.bindings_col_time")}</TableHead>
                      <TableHead className="w-[22%]">
                        {t("db_studio.bindings_col_notes")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {doc.artifact_bindings.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell className="font-mono text-xs align-top">
                          {b.artifact_ref}
                        </TableCell>
                        <TableCell className="text-xs align-top">
                          {b.truth_class_id ?? "—"}
                        </TableCell>
                        <TableCell className="text-xs align-top">
                          {b.scope_model_id ?? "—"}
                        </TableCell>
                        <TableCell className="text-xs align-top">
                          {b.time_model_id ?? "—"}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs align-top">
                          {b.notes ?? "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  )
}

export const DbStudioTruthPanel = memo(DbStudioTruthPanelInner)

function RegistryColumn(props: {
  readonly title: string
  readonly rows: readonly RegistryRow[]
  readonly emptyHint: string
}) {
  const { title, rows, emptyHint } = props

  return (
    <div className="bg-muted/30 min-h-[120px] rounded-lg border p-3">
      <h3 className="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase">
        {title}
      </h3>
      {rows.length === 0 ? (
        <p className="text-muted-foreground text-xs">{emptyHint}</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((row) => (
            <li key={row.id}>
              <div className="text-sm font-medium">{row.label}</div>
              <div className="text-muted-foreground font-mono text-[0.7rem]">
                {row.id}
              </div>
              {row.summary ? (
                <p className="text-muted-foreground mt-0.5 text-xs">
                  {row.summary}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
