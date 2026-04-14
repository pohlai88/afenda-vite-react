/* eslint-disable afenda-ui/no-inline-styles --
   Primary scale / radius demos use dynamic `var(--color-primary-*)` and `var(--radius-*)`. */
import { useTranslation } from "react-i18next"

import { cn } from "@afenda/design-system/utils"
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Separator,
  Table,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@afenda/design-system/ui-primitives"

import {
  PRIMARY_SCALE,
  RADIUS_KEYS,
  SEMANTIC_TOKEN_GROUPS,
} from "./marketing-token-playground-constants"
import { MarketingSectionHeading } from "./marketing-section-heading"
import { MarketingShowcaseCard } from "./marketing-showcase-card"
import { MarketingTokenSwatch } from "./marketing-token-swatch"

export function MarketingLandingTokenPlayground() {
  const { t } = useTranslation("shell")

  return (
    <Tabs defaultValue="tokens">
      <TabsList
        aria-label={t("marketing.token_playground.tabs_aria_label")}
        className="w-full max-w-md"
        variant="line"
      >
        <TabsTrigger value="tokens">
          {t("marketing.token_playground.tab_tokens")}
        </TabsTrigger>
        <TabsTrigger value="contract">
          {t("marketing.token_playground.tab_contract")}
        </TabsTrigger>
      </TabsList>

      <TabsContent className="pt-4" value="tokens">
        <div className="ui-stack-relaxed">
          <section className="ui-stack-tight" aria-labelledby="semantic-heading">
            <MarketingSectionHeading
              description={t("marketing.token_playground.section_semantic_hint")}
              eyebrow="Evidence"
              title={t("marketing.token_playground.section_semantic")}
            />

            <div className="grid gap-6">
              {SEMANTIC_TOKEN_GROUPS.map((group) => (
                <div className="space-y-3" key={group.key}>
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="ui-marketing-eyebrow">
                      {t(`marketing.token_playground.group_${group.key}`)}
                    </h3>
                    <Badge variant="outline">{group.items.length} tokens</Badge>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {group.items.map((name) => (
                      <MarketingTokenSwatch key={name} name={name} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <Separator />

          <section className="ui-stack-tight" aria-labelledby="scale-heading">
            <MarketingSectionHeading
              description={t("marketing.token_playground.primary_scale_note")}
              eyebrow="Scale"
              title={t("marketing.token_playground.section_primary_scale")}
            />

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 lg:grid-cols-10">
              {PRIMARY_SCALE.map((step) => (
                <div
                  className="rounded-xl border border-border/70 bg-card/50 p-3"
                  key={step}
                  title={`--color-primary-${step}`}
                >
                  <div
                    className="h-16 rounded-lg border border-border/80"
                    style={{ backgroundColor: `var(--color-primary-${step})` }}
                  />
                  <div className="mt-3 space-y-1 text-center">
                    <p className="ui-mono-token-sm text-foreground">{step}</p>
                    <code className="ui-mono-token block break-all text-muted-foreground">
                      --color-primary-{step}
                    </code>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <Separator />

          <section className="ui-stack-tight" aria-labelledby="radius-heading">
            <MarketingSectionHeading
              description={t("marketing.token_playground.radius_note")}
              eyebrow="Geometry"
              title={t("marketing.token_playground.section_radius")}
            />

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
              {RADIUS_KEYS.map((radius) => (
                <div
                  className="rounded-2xl border border-border/70 bg-card/50 p-4 text-center"
                  key={radius}
                >
                  <div
                    className="mx-auto mb-3 size-16 border border-border bg-muted shadow-sm"
                    style={{ borderRadius: `var(--radius-${radius})` }}
                  />
                  <p className="font-medium text-foreground">{radius}</p>
                  <code className="ui-mono-token mt-1 block text-muted-foreground">
                    --radius-{radius}
                  </code>
                </div>
              ))}
            </div>
          </section>

          <Separator />

          <section className="ui-stack-tight" aria-labelledby="showcase-heading">
            <MarketingSectionHeading
              description="Representative usage of typography, utilities, fields, and governed primitives."
              eyebrow="Showcase"
              title={t("marketing.token_playground.section_components")}
            />

            <div className="grid gap-4 lg:grid-cols-2">
              <MarketingShowcaseCard
                description="Type styles and emphasis utilities in their intended hierarchy."
                title={t("marketing.token_playground.section_typography")}
              >
                <div className="space-y-4">
                  <p className="ui-title-hero text-foreground">ui-title-hero</p>
                  <p className="ui-title-page text-foreground">ui-title-page</p>
                  <p className="ui-title-section text-foreground">ui-title-section</p>
                  <p className="ui-lede text-foreground">
                    {t("marketing.token_playground.typography_lede_demo")}
                  </p>
                  <p className="text-gradient text-2xl font-semibold">
                    text-gradient
                  </p>
                </div>
              </MarketingShowcaseCard>

              <MarketingShowcaseCard
                description="Core interactive states rendered against the current token set."
                title="Primitives"
              >
                <div className="space-y-5">
                  <div className="flex flex-wrap gap-2">
                    <Badge>default</Badge>
                    <Badge variant="secondary">secondary</Badge>
                    <Badge variant="destructive">destructive</Badge>
                    <Badge variant="outline">outline</Badge>
                    <Badge variant="ghost">ghost</Badge>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" type="button" variant="default">
                      default
                    </Button>
                    <Button size="sm" type="button" variant="secondary">
                      secondary
                    </Button>
                    <Button size="sm" type="button" variant="outline">
                      outline
                    </Button>
                    <Button size="sm" type="button" variant="ghost">
                      ghost
                    </Button>
                    <Button size="sm" type="button" variant="destructive">
                      destructive
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground" htmlFor="playground-field">
                      {t("marketing.token_playground.field_label")}
                    </Label>
                    <Input
                      className="ui-field"
                      id="playground-field"
                      placeholder={t("marketing.token_playground.field_placeholder")}
                    />
                  </div>
                </div>
              </MarketingShowcaseCard>

              <MarketingShowcaseCard
                description="Utility-level patterns for edge highlights, focus, and controlled visual accent."
                title={t("marketing.token_playground.section_utilities")}
              >
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="ui-surface-card relative overflow-hidden p-4">
                    <p className="text-sm font-medium text-foreground">line-t</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t("marketing.token_playground.utility_line_t")}
                    </p>
                    <div className="line-t mt-4 py-2">
                      <span className="text-xs text-muted-foreground">
                        {t("marketing.token_playground.demo_hairline_content")}
                      </span>
                    </div>
                  </div>

                  <div className="ui-surface-card p-4">
                    <p className="text-sm font-medium text-foreground">focus-ring</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t("marketing.token_playground.utility_focus")}
                    </p>
                    {/* Native control: `focus-ring` must not compete with Button focus styles (utility_focus_note). */}
                    <button
                      className={cn(
                        "focus-ring mt-4 rounded-md border border-transparent bg-secondary px-3 py-2 text-left text-sm text-secondary-foreground transition-colors hover:bg-secondary/90",
                      )}
                      type="button"
                    >
                      {t("marketing.token_playground.demo_tab_focus")}
                    </button>
                  </div>

                  <div className="ui-surface-card p-4">
                    <p className="text-sm font-medium text-foreground">text-gradient</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t("marketing.token_playground.utility_gradient")}
                    </p>
                    <p className="text-gradient mt-4 text-2xl font-bold">
                      {t("marketing.token_playground.demo_gradient_sample")}
                    </p>
                  </div>
                </div>
              </MarketingShowcaseCard>

              <MarketingShowcaseCard
                description="Representative surface layering for cards, panels, tables, and code."
                title={t("marketing.token_playground.section_surfaces")}
              >
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="ui-surface-card p-4">
                      <p className="text-sm font-medium text-card-foreground">
                        {t("marketing.token_playground.surface_card")}
                      </p>
                    </div>
                    <div className="ui-surface-panel p-4">
                      <p className="text-sm font-medium text-secondary-foreground">
                        {t("marketing.token_playground.surface_panel")}
                      </p>
                    </div>
                    <div className="ui-empty-state">
                      <p>{t("marketing.token_playground.surface_empty")}</p>
                    </div>
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
                        <tr>
                          <td>{t("marketing.token_playground.sample_table_row1")}</td>
                          <td>{t("marketing.token_playground.sample_status_ok")}</td>
                        </tr>
                        <tr>
                          <td>{t("marketing.token_playground.sample_table_row2")}</td>
                          <td>
                            {t("marketing.token_playground.sample_status_pending")}
                          </td>
                        </tr>
                      </tbody>
                    </Table>
                  </div>

                  <pre className="ui-code-block overflow-x-auto p-4 text-left text-sm">
                    <code>{t("marketing.token_playground.code_sample")}</code>
                  </pre>
                </div>
              </MarketingShowcaseCard>
            </div>
          </section>
        </div>
      </TabsContent>

      <TabsContent className="pt-4" value="contract">
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="ui-title-page">
              {t("marketing.token_playground.section_contract")}
            </CardTitle>
            <CardDescription>
              {t("marketing.token_playground.contract_intro")}
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-3 pr-4 font-semibold text-foreground">
                    {t("marketing.token_playground.contract_header_layer")}
                  </th>
                  <th className="py-3 pr-4 font-semibold text-foreground">
                    {t("marketing.token_playground.contract_header_example")}
                  </th>
                  <th className="py-3 font-semibold text-foreground">
                    {t("marketing.token_playground.contract_header_source")}
                  </th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b border-border">
                  <td className="py-4 pr-4 align-top text-foreground">
                    {t("marketing.token_playground.contract_row_theme")}
                  </td>
                  <td className="py-4 pr-4 font-mono text-xs">
                    {t("marketing.token_playground.contract_row_theme_ex")}
                  </td>
                  <td className="py-4 font-mono text-xs">
                    {t("marketing.token_playground.contract_row_theme_src")}
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-4 pr-4 align-top text-foreground">
                    {t("marketing.token_playground.contract_row_utility")}
                  </td>
                  <td className="py-4 pr-4 font-mono text-xs">
                    {t("marketing.token_playground.contract_row_utility_ex")}
                  </td>
                  <td className="py-4 font-mono text-xs">
                    {t("marketing.token_playground.contract_row_utility_src")}
                  </td>
                </tr>
                <tr>
                  <td className="py-4 pr-4 align-top text-foreground">
                    {t("marketing.token_playground.contract_row_component")}
                  </td>
                  <td className="py-4 pr-4 font-mono text-xs">
                    {t("marketing.token_playground.contract_row_component_ex")}
                  </td>
                  <td className="py-4 font-mono text-xs">
                    {t("marketing.token_playground.contract_row_component_src")}
                  </td>
                </tr>
              </tbody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
