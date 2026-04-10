import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { LanguageSwitcher } from "@/share/i18n"
import { useAppShellStore } from "@/share/client-store/app-shell-store"
import { Button } from "@afenda/shadcn-ui/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@afenda/shadcn-ui/components/ui/card"

export function DashboardView() {
  const { currentUser } = useAppShellStore()
  const { t } = useTranslation("dashboard")

  const displayName = currentUser?.name ?? t("header.guest_name.label")

  return (
    <section className="ui-page ui-stack-relaxed">
      <header className="ui-header">
        <div className="ui-page-actions-row">
          <div>
            <h1 className="ui-title-hero">{t("header.title.label")}</h1>
            <p className="ui-lede">
              {t("header.welcome.message", { name: displayName })}
            </p>
            <p className="ui-fine">
              {t("demo.priority_items", { count: 1 })}
              {` ${t("demo.separator")} `}
              {t("demo.priority_items", { count: 3 })}
            </p>
          </div>
          <LanguageSwitcher />
        </div>
      </header>

      <div className="ui-card-grid">
        <Card>
          <CardContent className="ui-stack">
            <CardTitle>{t("card.inventory.title.label")}</CardTitle>
            <CardDescription>
              {t("card.inventory.description.message")}
            </CardDescription>
            <Button variant="link" size="text" asChild>
              <Link to="/app/inventory">{t("card.inventory.link.label")}</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="ui-stack">
            <CardTitle>{t("card.sales.title.label")}</CardTitle>
            <CardDescription>
              {t("card.sales.description.message")}
            </CardDescription>
            <Button variant="link" size="text" asChild>
              <Link to="/app/sales">{t("card.sales.link.label")}</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="ui-stack">
            <CardTitle>{t("card.customers.title.label")}</CardTitle>
            <CardDescription>
              {t("card.customers.description.message")}
            </CardDescription>
            <Button variant="link" size="text" asChild>
              <Link to="/app/customers">{t("card.customers.link.label")}</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="ui-stack">
            <CardTitle>{t("card.finance.title.label")}</CardTitle>
            <CardDescription>
              {t("card.finance.description.message")}
            </CardDescription>
            <Button variant="link" size="text" asChild>
              <Link to="/app/finance">{t("card.finance.link.label")}</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="ui-stack">
            <CardTitle>{t("card.employees.title.label")}</CardTitle>
            <CardDescription>
              {t("card.employees.description.message")}
            </CardDescription>
            <Button variant="link" size="text" asChild>
              <Link to="/app/employees">{t("card.employees.link.label")}</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="ui-stack">
            <CardTitle>{t("card.reports.title.label")}</CardTitle>
            <CardDescription>
              {t("card.reports.description.message")}
            </CardDescription>
            <Button variant="link" size="text" asChild>
              <Link to="/app/reports">{t("card.reports.link.label")}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
