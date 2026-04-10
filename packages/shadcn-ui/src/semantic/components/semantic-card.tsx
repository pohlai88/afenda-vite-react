import { forwardRef, type ReactNode } from "react"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card"
import type { CardPadding, CardSurface } from "../../lib/constant/component/card"
import { getPanelEmphasisClass } from "../../lib/constant/semantic/emphasis"
import { cn } from "../../lib/utils"
import type { SemanticDensity } from "../primitives/density"
import type { SemanticEmphasis } from "../primitives/emphasis"
import type { SemanticSurface } from "../primitives/surface"

const semanticCardSurfaceMap: Record<SemanticSurface, CardSurface> = {
  panel: "default",
  canvas: "muted",
  elevated: "elevated",
  overlay: "interactive",
  inverse: "default",
}

const semanticCardPaddingMap: Record<SemanticDensity, CardPadding> = {
  compact: "sm",
  default: "default",
  comfortable: "lg",
}

export interface SemanticCardProps {
  title?: ReactNode
  description?: ReactNode
  action?: ReactNode
  footer?: ReactNode
  surface?: SemanticSurface
  emphasis?: SemanticEmphasis
  density?: SemanticDensity
  children?: ReactNode
  className?: string
}

export const SemanticCard = forwardRef<HTMLDivElement, SemanticCardProps>(
  (
    {
      title,
      description,
      action,
      footer,
      surface = "panel",
      emphasis = "soft",
      density = "default",
      children,
      className,
    },
    ref
  ) => {
    return (
      <Card
        ref={ref}
        data-slot="semantic-card"
        surface={semanticCardSurfaceMap[surface]}
        padding={semanticCardPaddingMap[density]}
        className={cn(
          getPanelEmphasisClass(emphasis),
          surface === "inverse" ? "bg-foreground text-background" : null,
          className
        )}
      >
        {title || description || action ? (
          <CardHeader className="border-b border-border/60">
            {title ? <CardTitle>{title}</CardTitle> : null}
            {description ? <CardDescription>{description}</CardDescription> : null}
            {action ? <CardAction>{action}</CardAction> : null}
          </CardHeader>
        ) : null}
        <CardContent>{children}</CardContent>
        {footer ? (
          <CardFooter className="border-t border-border/60">{footer}</CardFooter>
        ) : null}
      </Card>
    )
  }
)

SemanticCard.displayName = "SemanticCard"
