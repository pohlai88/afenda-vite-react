import { useTranslation } from "react-i18next"
import { ArrowRight, Palette, ShieldCheck, Sparkles } from "lucide-react"

import { cn } from "@afenda/design-system/utils"
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Table,
} from "@afenda/design-system/ui-primitives"

import {
  PRIMARY_SCALE,
  RADIUS_KEYS,
  SEMANTIC_SWATCHES,
} from "./marketing-token-playground-constants"
import { MarketingStatCard } from "./marketing-stat-card"

export function MarketingExperiencePreview() {
  const { t } = useTranslation("shell")

  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
      <Card className="overflow-hidden border-border/70 shadow-sm">
        <CardHeader className="border-b border-border/70 bg-muted/30">
          <CardTitle className="text-base">
            {t("marketing.token_playground.section_shell")}
          </CardTitle>
          <CardDescription>
            {t("marketing.token_playground.shell_note")}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid min-h-80 min-w-0 grid-cols-[15rem_minmax(0,1fr)]">
            <aside className="border-r border-border/70 bg-card p-4">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                  <Sparkles className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    AFENDA
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    Business Truth Engine
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {["Overview", "Orders", "Allocation", "Settlement", "Audit"].map(
                  (item, index) => (
                    <Button
                      key={item}
                      className={cn(
                        "w-full justify-between px-3",
                        index !== 0 && "text-muted-foreground",
                      )}
                      type="button"
                      variant={index === 0 ? "default" : "ghost"}
                    >
                      <span>{item}</span>
                      {index === 0 ? <ArrowRight className="size-4" /> : null}
                    </Button>
                  ),
                )}
              </div>
            </aside>

            <section className="min-w-0 bg-background p-5">
              <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <p className="ui-marketing-eyebrow">Workspace preview</p>
                  <h3 className="text-xl font-semibold tracking-tight text-foreground">
                    Revenue assurance cockpit
                  </h3>
                  <p className="max-w-xl text-sm leading-6 text-muted-foreground">
                    Dense information, clear emphasis, low visual fatigue,
                    governed surfaces.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary">Live tokens</Badge>
                  <Badge variant="outline">Shell-ready</Badge>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-border bg-card p-4">
                  <p className="text-xs text-muted-foreground">Contracts</p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">
                    128
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Verified governed components
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-4">
                  <p className="text-xs text-muted-foreground">Contrast</p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">
                    Stable
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Long-hours screen usage
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-4">
                  <p className="text-xs text-muted-foreground">State model</p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">
                    Governed
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Theme, utility, component alignment
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-border bg-card p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-medium text-card-foreground">
                    Audit exceptions
                  </p>
                  <Badge variant="destructive">3 critical</Badge>
                </div>
                <div className="overflow-hidden rounded-lg border border-border">
                  <Table className="ui-table">
                    <thead>
                      <tr>
                        <th>Entity</th>
                        <th>Status</th>
                        <th>Owner</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>INV-2026-000184</td>
                        <td>Pending review</td>
                        <td>Finance Ops</td>
                      </tr>
                      <tr>
                        <td>REC-2026-002011</td>
                        <td>Variance detected</td>
                        <td>Reconciliation</td>
                      </tr>
                    </tbody>
                  </Table>
                </div>
              </div>
            </section>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        <MarketingStatCard
          hint="Surface, content, feedback, and chrome"
          icon={<Palette className="size-4" />}
          title="Semantic tokens"
          value={String(SEMANTIC_SWATCHES.length)}
        />
        <MarketingStatCard
          hint="Primary tonal progression for accents and emphasis"
          icon={<Sparkles className="size-4" />}
          title="Primary scale"
          value={String(PRIMARY_SCALE.length)}
        />
        <MarketingStatCard
          hint="Radius contract for system-wide consistency"
          icon={<ShieldCheck className="size-4" />}
          title="Radius keys"
          value={String(RADIUS_KEYS.length)}
        />
      </div>
    </div>
  )
}
