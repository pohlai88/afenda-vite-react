import { Link, useLocation } from "react-router-dom"
import { ChevronDownIcon } from "lucide-react"

import { Button } from "@afenda/shadcn-ui/components/ui/button"
import { cn } from "@afenda/shadcn-ui/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@afenda/shadcn-ui/components/ui/dropdown-menu"

import { isTopNavItemActive, type TopNavGroup } from "../nav-catalog/nav-model"

export interface TopNavGroupMenuProps {
  group: TopNavGroup
}

export function TopNavGroupMenu({ group }: TopNavGroupMenuProps) {
  const { pathname, search } = useLocation()
  const hasActiveChild = group.items.some((item) =>
    isTopNavItemActive(pathname, item, search)
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 gap-1 rounded-md border border-transparent bg-transparent px-2.5 text-(length:--top-nav-font-size) leading-tight font-medium text-muted-foreground/85 hover:border-border/60 hover:bg-muted/35 hover:text-foreground [&_svg]:size-3.5",
            hasActiveChild && "border-border/55 bg-muted/35 text-foreground"
          )}
        >
          {group.label}
          <ChevronDownIcon aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {group.items.map((item) => {
          const isActive = isTopNavItemActive(pathname, item, search)
          const Icon = item.icon

          return (
            <DropdownMenuItem key={item.to} asChild>
              <Link
                to={item.to}
                aria-current={isActive ? "page" : undefined}
                data-active={isActive}
              >
                {Icon ? <Icon className="shrink-0 opacity-70" /> : null}
                {item.label}
              </Link>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
