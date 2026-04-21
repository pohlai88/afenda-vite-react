import type { ReactNode } from "react"

import { cn } from "@afenda/design-system/utils"

export type SetupShellProps = {
  readonly title: string
  readonly description: string
  readonly children: ReactNode
  readonly aside?: ReactNode
  readonly className?: string
}

export function SetupShell({
  title,
  description,
  children,
  aside,
  className,
}: SetupShellProps) {
  return (
    <section className={cn("setup-shell", className)}>
      <div className="setup-shell-main">
        <div className="setup-shell-copy">
          <h1 className="setup-shell-title text-foreground">{title}</h1>
          <p className="setup-shell-description">{description}</p>
        </div>

        {children}
      </div>

      {aside ? <aside className="setup-shell-aside">{aside}</aside> : null}
    </section>
  )
}
