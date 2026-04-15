import type { ReactNode } from "react"

import {
  Card,
  CardContent,
  CardHeader,
} from "@afenda/design-system/ui-primitives"

type AuthFocusedShellProps = {
  readonly title: string
  readonly description?: string
  readonly children: ReactNode
  readonly footer?: ReactNode
  readonly supportAside?: ReactNode
}

/**
 * Lighter public auth shell for recovery / verification flows where users
 * want low distraction and fast completion.
 */
export function AuthFocusedShell(props: AuthFocusedShellProps) {
  const { title, description, children, footer, supportAside } = props

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <section className="ui-page py-10 lg:py-14">
        <div
          className={`mx-auto grid w-full gap-[1.5rem] ${
            supportAside
              ? "max-w-5xl lg:grid-cols-[minmax(0,1fr)_18rem]"
              : "max-w-lg"
          }`}
        >
          <div className="w-full">
            <Card className="rounded-2xl border-border shadow-sm">
              <CardHeader className="space-y-2">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                  {title}
                </h1>
                {description ? (
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {description}
                  </p>
                ) : null}
              </CardHeader>

              <CardContent>
                <div className="space-y-6">
                  {children}
                  {footer ? <div>{footer}</div> : null}
                </div>
              </CardContent>
            </Card>
          </div>

          {supportAside ? (
            <aside className="rounded-2xl border border-border-muted bg-card/55 p-[1rem]">
              {supportAside}
            </aside>
          ) : null}
        </div>
      </section>
    </main>
  )
}
