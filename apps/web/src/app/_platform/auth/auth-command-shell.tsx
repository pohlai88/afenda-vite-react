import type { ReactNode } from "react"

type AuthCommandShellProps = {
  readonly title: string
  readonly description?: string
  readonly leftPanel: ReactNode
  readonly rightPanel: ReactNode
  readonly children: ReactNode
  readonly footer?: ReactNode
}

/**
 * Shared full-width auth command center shell for `/login`, `/register`, `/forgot-password`, `/reset-password`.
 */
export function AuthCommandShell({
  title,
  description,
  leftPanel,
  rightPanel,
  children,
  footer,
}: AuthCommandShellProps) {
  return (
    <main className="min-h-dvh bg-background text-foreground">
      <section className="ui-page ui-stack-relaxed py-10 lg:py-14">
        <header className="ui-stack-tight max-w-2xl">
          <h1 className="ui-title-page text-balance">{title}</h1>
          {description ? (
            <p className="text-wrap-balance ui-lede">{description}</p>
          ) : null}
        </header>

        <div className="ui-workbench-grid">
          <aside className="ui-density-panel rounded-2xl ui-shell-panel p-4 sm:p-5">
            {leftPanel}
          </aside>

          <section className="ui-command-surface rounded-2xl p-4 sm:p-6">
            {children}
            {footer ? <div className="mt-6">{footer}</div> : null}
          </section>

          <aside className="ui-density-panel rounded-2xl ui-shell-panel p-4 sm:p-5">
            {rightPanel}
          </aside>
        </div>
      </section>
    </main>
  )
}
