import type { ReactNode } from "react"

type AuthAdaptiveShellProps = {
  readonly title: string
  readonly description?: string
  readonly leftPanel: ReactNode
  readonly rightPanel: ReactNode
  readonly children: ReactNode
  readonly footer?: ReactNode
}

/**
 * Premium workbench shell for adaptive entry flows such as login and
 * security-aware registration.
 */
export function AuthAdaptiveShell(props: AuthAdaptiveShellProps) {
  const { title, description, leftPanel, rightPanel, children, footer } = props

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
          <aside className="ui-density-panel rounded-2xl ui-shell-panel p-[1rem] sm:p-[1.25rem]">
            {leftPanel}
          </aside>

          <section className="ui-command-surface rounded-2xl p-[1rem] sm:p-[1.5rem]">
            {children}
            {footer ? <div className="mt-6">{footer}</div> : null}
          </section>

          <aside className="ui-density-panel rounded-2xl ui-shell-panel p-[1rem] sm:p-[1.25rem]">
            {rightPanel}
          </aside>
        </div>
      </section>
    </main>
  )
}
