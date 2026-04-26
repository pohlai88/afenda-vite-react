import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { useTenantScope } from "@/app/_platform/tenant"
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  Progress,
} from "@afenda/design-system/ui-primitives"

import {
  dashboardModuleCards,
  dashboardReadinessItems,
  dashboardStatCards,
  dashboardTrendChartConfig,
  dashboardTrendSeries,
} from "./dashboard-view-model"

function resolveGreetingName(): string {
  return "User"
}

function translateDashboardNamespaceKey(
  translate: ReturnType<typeof useTranslation<"dashboard">>["t"],
  labelKey: string
): string {
  return translate(labelKey as never)
}

export function DashboardPage() {
  const { t } = useTranslation("dashboard")
  const scope = useTenantScope()

  const greetingName = useMemo(() => {
    if (scope.status !== "ready") {
      return t("header.guest_name.label")
    }

    return resolveGreetingName()
  }, [scope.status, t])

  const workspaceLabel =
    scope.status === "ready"
      ? (scope.me.tenant?.memberships[0]?.tenantName ?? "Afenda Workspace")
      : "Afenda Workspace"

  return (
    <section className="ui-page ui-stack-relaxed">
      <header className="overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-background via-background to-muted/70 p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <Badge variant="outline" className="w-fit">
              {t("hero.badge")}
            </Badge>
            <div className="space-y-2">
              <h1 className="ui-title-page">{t("header.title.label")}</h1>
              <p className="ui-lede">
                {t("header.welcome.message", { name: greetingName })}
              </p>
              <p className="max-w-2xl text-sm text-muted-foreground">
                {t("hero.description")}
              </p>
            </div>
          </div>
          <div className="grid gap-3 rounded-2xl border border-border/70 bg-card/80 p-4 sm:grid-cols-2">
            <div>
              <div className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
                {t("hero.priority.label")}
              </div>
              <div className="mt-1 text-lg font-semibold text-foreground">
                {t("demo.priority_items", { count: 5 })}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
                {t("hero.workspace.label")}
              </div>
              <div className="mt-1 text-lg font-semibold text-foreground">
                {workspaceLabel}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {dashboardStatCards.map((stat) => (
          <Card key={stat.id} className="border-border/70">
            <CardHeader className="pb-3">
              <CardDescription>
                {translateDashboardNamespaceKey(t, stat.labelKey)}
              </CardDescription>
              <CardTitle className="text-3xl">{stat.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge
                variant={stat.tone === "warning" ? "secondary" : "outline"}
                className="text-xs"
              >
                {translateDashboardNamespaceKey(t, stat.helperKey)}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.9fr)]">
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>{t("chart.title")}</CardTitle>
            <CardDescription>{t("chart.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              className="h-[280px] w-full"
              config={dashboardTrendChartConfig}
            >
              <BarChart data={dashboardTrendSeries}>
                <CartesianGrid vertical={false} />
                <XAxis
                  axisLine={false}
                  dataKey="name"
                  tickLine={false}
                  tickMargin={10}
                />
                <YAxis axisLine={false} tickLine={false} tickMargin={10} />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  cursor={false}
                />
                <Bar
                  dataKey="revenue"
                  fill="var(--color-revenue)"
                  radius={[8, 8, 0, 0]}
                />
                <Bar
                  dataKey="operations"
                  fill="var(--color-operations)"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>{t("readiness.title")}</CardTitle>
            <CardDescription>{t("readiness.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboardReadinessItems.map((item) => (
              <div key={item.id} className="space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-foreground">
                      {translateDashboardNamespaceKey(t, item.labelKey)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {translateDashboardNamespaceKey(t, item.helperKey)}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {item.completion}%
                  </span>
                </div>
                <Progress value={item.completion} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {dashboardModuleCards.map((card) => (
          <Card
            key={card.id}
            className={`border-border/70 transition-colors hover:border-primary/40 ${card.accentClassName}`}
          >
            <CardHeader>
              <CardTitle>
                {translateDashboardNamespaceKey(t, card.titleKey)}
              </CardTitle>
              <CardDescription>
                {translateDashboardNamespaceKey(t, card.descriptionKey)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                asChild
                variant="ghost"
                className="px-0 text-primary hover:bg-transparent"
              >
                <Link to={card.href}>
                  {translateDashboardNamespaceKey(t, card.linkLabelKey)}
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
