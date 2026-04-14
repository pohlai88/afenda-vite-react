"use client"

import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { ChevronsUpDown } from "lucide-react"

import {
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@afenda/design-system/ui-primitives"
import { cn } from "@afenda/design-system/utils"

import type { ShellBreadcrumbResolvedItem } from "../../contract/shell-breadcrumb-contract"

export type ShellTopNavBreadcrumbsProps = {
  items: readonly ShellBreadcrumbResolvedItem[]
  className?: string
}

export function ShellTopNavBreadcrumbs({
  items,
  className,
}: ShellTopNavBreadcrumbsProps) {
  const { t } = useTranslation("shell")

  if (items.length === 0) {
    return (
      <span
        className={cn("truncate text-sm text-muted-foreground", className)}
      >
        {t("nav.breadcrumb_root")}
      </span>
    )
  }

  return (
    <Breadcrumb className={cn("min-w-0", className)}>
      <BreadcrumbList className="flex-nowrap items-center gap-0.5 sm:gap-0.5">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          const showEnv = isLast
          return (
            <span key={item.id} className="contents">
              {index > 0 ? (
                <BreadcrumbSeparator className="px-1 text-muted-foreground/70 select-none [&>svg]:hidden">
                  /
                </BreadcrumbSeparator>
              ) : null}
              <BreadcrumbItem className="max-w-40 sm:max-w-48">
                {isLast ? (
                  <span className="flex min-w-0 items-center gap-1.5">
                    <BreadcrumbPage className="truncate text-base/none font-medium">
                      {item.label}
                    </BreadcrumbPage>
                    {showEnv ? <ShellTopNavEnvironmentMenu /> : null}
                  </span>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 max-w-full gap-1 rounded-md px-2 font-normal text-muted-foreground hover:bg-accent/30 hover:text-foreground"
                        aria-label={t("breadcrumb.aria_label")}
                      >
                        <span className="truncate text-sm">{item.label}</span>
                        <ChevronsUpDown
                          className="size-3 shrink-0 opacity-60"
                          aria-hidden
                        />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56">
                      <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                        {item.label}
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {item.to ? (
                        <DropdownMenuItem asChild>
                          <Link to={item.to} className="cursor-pointer">
                            {t("top_nav.open_scope")}
                          </Link>
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem disabled>
                          {t("top_nav.no_other_scopes")}
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </BreadcrumbItem>
            </span>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

function ShellTopNavEnvironmentMenu() {
  const envLabel = resolveShellTopNavEnvironmentLabel()
  if (!envLabel) {
    return null
  }

  return (
    <Badge
      variant="outline"
      className="h-6 rounded-full border-border/70 bg-background/60 px-2 text-[10px] font-semibold tracking-[0.04em] text-foreground/80 uppercase"
    >
      {envLabel}
    </Badge>
  )
}

function resolveShellTopNavEnvironmentLabel(): string | null {
  const explicit = import.meta.env.VITE_APP_ENV_LABEL?.trim()
  if (explicit) {
    return explicit
  }

  const mode = import.meta.env.MODE?.trim()
  return mode ? mode : null
}
