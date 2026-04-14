import { useTranslation } from "react-i18next"

import { cn } from "@afenda/design-system/utils"
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Separator,
  Table,
} from "@afenda/design-system/ui-primitives"

import { MarketingSectionHeading } from "./marketing-section-heading"

export function MarketingIndexCssAtlas() {
  const { t } = useTranslation("shell")

  return (
    <section
      aria-labelledby="index-css-atlas-heading"
      className="ui-stack-relaxed"
      id="index-css-atlas"
    >
      <MarketingSectionHeading
        description={t("marketing.index_css.description")}
        eyebrow={t("marketing.index_css.eyebrow")}
        title={t("marketing.index_css.title")}
        titleId="index-css-atlas-heading"
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/70 shadow-sm">
          <CardHeader className="space-y-1 pb-2">
            <CardTitle className="text-base">{t("marketing.index_css.capability_theme_title")}</CardTitle>
            <CardDescription>{t("marketing.index_css.capability_theme_body")}</CardDescription>
          </CardHeader>
        </Card>
        <Card className="border-border/70 shadow-sm">
          <CardHeader className="space-y-1 pb-2">
            <CardTitle className="text-base">{t("marketing.index_css.capability_utilities_title")}</CardTitle>
            <CardDescription>{t("marketing.index_css.capability_utilities_body")}</CardDescription>
          </CardHeader>
        </Card>
        <Card className="border-border/70 shadow-sm">
          <CardHeader className="space-y-1 pb-2">
            <CardTitle className="text-base">{t("marketing.index_css.capability_layers_title")}</CardTitle>
            <CardDescription>{t("marketing.index_css.capability_layers_body")}</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">{t("marketing.index_css.group_layout")}</CardTitle>
            <CardDescription>{t("marketing.index_css.group_layout_hint")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <ul className="list-inside list-disc space-y-1 font-mono text-xs text-foreground">
              <li>ui-page</li>
              <li>ui-stack-relaxed · ui-stack-tight</li>
              <li>ui-header</li>
            </ul>
            <div className="ui-header rounded-lg border border-border/80 bg-muted/20 p-4">
              <p className="ui-title-section text-foreground">{t("marketing.index_css.sample_section_title")}</p>
              <p className="ui-lede mt-1">{t("marketing.index_css.sample_lede")}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">{t("marketing.index_css.group_typography")}</CardTitle>
            <CardDescription>{t("marketing.index_css.group_typography_hint")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="ui-title-hero text-foreground">ui-title-hero</p>
            <p className="ui-title-page text-foreground">ui-title-page</p>
            <p className="ui-title-section text-foreground">ui-title-section</p>
            <p className="ui-lede">{t("marketing.token_playground.typography_lede_demo")}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">{t("marketing.index_css.group_shell")}</CardTitle>
          <CardDescription>{t("marketing.index_css.group_shell_hint")}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex max-h-[min(28rem,70vh)] flex-col border-t border-border">
            <div className="ui-shell-header-strip">
              <span className="truncate text-sm font-semibold text-foreground">AFENDA</span>
              <div className="ui-shell-header-actions-row">
                <Badge variant="secondary">{t("marketing.index_css.shell_badge")}</Badge>
                <div className="ui-shell-trailing-slot rounded-md border border-dashed border-border/80" />
              </div>
            </div>
            <div className="ui-shell-slot-top">
              <p className="text-xs font-medium text-muted-foreground">{t("marketing.index_css.slot_top_label")}</p>
            </div>
            <div className="flex min-h-48 min-w-0 flex-1">
              <aside className="flex w-52 flex-col border-r border-border bg-card">
                <div className="ui-shell-sidebar-brand">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-bold">
                    A
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">Tenant</p>
                    <p className="truncate text-xs text-muted-foreground">Workspace</p>
                  </div>
                </div>
                <div className="flex-1" />
                <div className="ui-shell-sidebar-footer-slot text-xs text-muted-foreground">
                  {t("marketing.index_css.sidebar_footer_hint")}
                </div>
              </aside>
              <div className="ui-shell-content min-w-0 flex-1 text-sm leading-relaxed text-muted-foreground">
                {t("marketing.index_css.shell_content_sample")}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">{t("marketing.index_css.group_utilities")}</CardTitle>
            <CardDescription>{t("marketing.index_css.group_utilities_hint")}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div className="ui-surface-card relative overflow-hidden p-3">
              <p className="text-xs font-medium text-foreground">line-t</p>
              <div className="line-t mt-3 py-2">
                <span className="text-xs text-muted-foreground">{t("marketing.token_playground.demo_hairline_content")}</span>
              </div>
            </div>
            <div className="ui-surface-card p-3">
              <p className="text-xs font-medium text-foreground">focus-ring</p>
              <button
                className={cn(
                  "focus-ring mt-3 w-full rounded-md border border-transparent bg-secondary px-2 py-1.5 text-left text-xs text-secondary-foreground",
                )}
                type="button"
              >
                {t("marketing.token_playground.demo_tab_focus")}
              </button>
            </div>
            <div className="ui-surface-card p-3">
              <p className="text-xs font-medium text-foreground">text-gradient</p>
              <p className="text-gradient mt-3 text-lg font-bold leading-tight">
                {t("marketing.token_playground.demo_gradient_sample")}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">{t("marketing.index_css.group_components")}</CardTitle>
            <CardDescription>{t("marketing.index_css.group_components_hint")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-foreground" htmlFor="atlas-field">
                {t("marketing.token_playground.field_label")}
              </Label>
              <Input className="ui-field" id="atlas-field" placeholder={t("marketing.token_playground.field_placeholder")} />
            </div>
            <div className="overflow-x-auto rounded-lg border border-border">
              <Table className="ui-table">
                <thead>
                  <tr>
                    <th>{t("marketing.token_playground.sample_table_name")}</th>
                    <th>{t("marketing.token_playground.sample_table_status")}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr aria-selected="true">
                    <td>{t("marketing.index_css.table_selected_row")}</td>
                    <td>{t("marketing.index_css.table_selected_status")}</td>
                  </tr>
                  <tr>
                    <td>{t("marketing.token_playground.sample_table_row2")}</td>
                    <td>{t("marketing.token_playground.sample_status_pending")}</td>
                  </tr>
                </tbody>
              </Table>
            </div>
            <pre className="ui-code-block overflow-x-auto p-3 text-left text-xs">
              <code>{t("marketing.token_playground.code_sample")}</code>
            </pre>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">{t("marketing.index_css.group_responsive")}</CardTitle>
            <CardDescription>{t("marketing.index_css.group_responsive_hint")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">{t("marketing.index_css.desktop_only")}</p>
            <p className="ui-visible-desktop-only rounded-md border border-dashed border-primary/40 bg-primary/5 px-3 py-2 text-sm font-medium text-primary">
              {t("marketing.index_css.desktop_only_badge")}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">{t("marketing.index_css.group_tooling")}</CardTitle>
            <CardDescription>{t("marketing.index_css.group_tooling_hint")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm leading-relaxed text-muted-foreground">
            <p>{t("marketing.index_css.tooling_body")}</p>
            <Separator />
            <p className="font-mono text-xs text-foreground">{t("marketing.index_css.tooling_plugins")}</p>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
