import type { ReactNode } from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/design-system/ui-primitives"
import { cn } from "@afenda/design-system/utils"

export type AuthCardFrameProps = {
  readonly children: ReactNode
  readonly description?: ReactNode
  readonly footer?: ReactNode
  readonly title: ReactNode
  readonly className?: string
}

export function AuthCardFrame(props: AuthCardFrameProps) {
  const { children, description, footer, title, className } = props

  return (
    <Card className={cn("auth-panel-card py-0", className)}>
      <CardHeader className="auth-panel-header">
        <CardTitle className="auth-panel-title">{title}</CardTitle>
        {description ? (
          <CardDescription className="auth-panel-description">
            {description}
          </CardDescription>
        ) : null}
      </CardHeader>

      <CardContent className="auth-panel-content">
        {children}
        {footer ? <div className="auth-panel-footer">{footer}</div> : null}
      </CardContent>
    </Card>
  )
}
