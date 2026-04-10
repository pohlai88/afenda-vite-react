import { Link, useLocation } from "react-router-dom"

import { Button } from "@afenda/shadcn-ui/components/ui/button"
import { cn } from "@afenda/shadcn-ui/lib/utils"

import { isTopNavItemActive, type TopNavItem } from "../nav-catalog/nav-model"

export interface TopNavLinkProps {
  item: TopNavItem
}

export function TopNavLink({ item }: TopNavLinkProps) {
  const { pathname, search } = useLocation()
  const isActive = isTopNavItemActive(pathname, item, search)

  return (
    <Button
      variant="ghost"
      size="sm"
      asChild
      className={cn(
        "h-8 shrink-0 rounded-md border border-transparent bg-transparent px-2.5 text-(length:--top-nav-font-size) leading-tight font-medium text-muted-foreground/85 hover:border-border/60 hover:bg-muted/35 hover:text-foreground",
        isActive && "border-border/55 bg-muted/35 text-foreground"
      )}
    >
      <Link to={item.to} aria-current={isActive ? "page" : undefined}>
        {item.label}
      </Link>
    </Button>
  )
}
