import { Toaster } from "@afenda/design-system/ui-primitives"
import { useTranslation } from "react-i18next"
import { Link, Outlet } from "react-router-dom"

export function SetupLayout() {
  const { t } = useTranslation("auth")
  const text = (key: string) => String(t(key as never))

  return (
    <div className="auth-root setup-root">
      <div className="setup-layout">
        <div className="setup-layout-shell">
          <header className="setup-layout-header">
            <Link
              to="/"
              className="text-base font-semibold tracking-[-0.03em] text-foreground"
              translate="no"
            >
              Afenda
            </Link>

            <p className="text-xs font-medium tracking-[0.28em] text-muted-foreground uppercase">
              {text("setup.shell.label")}
            </p>
          </header>

          <main className="setup-layout-main">
            <Outlet />
          </main>

          <footer className="setup-layout-footer">
            <p className="text-sm text-muted-foreground">
              {text("setup.shell.footer")}
            </p>
          </footer>
        </div>
      </div>

      <Toaster />
    </div>
  )
}
