"use client"

import type { ComponentProps } from "react"
import { Search } from "lucide-react"
import { useId } from "react"
import { useTranslation } from "react-i18next"

import {
  Label,
  SidebarGroup,
  SidebarGroupContent,
  SidebarInput,
} from "@afenda/design-system/ui-primitives"
import { cn } from "@afenda/design-system/utils"

const SHELL_SIDEBAR_SEARCH_FIELD_NAME = "shell-sidebar-search" as const

export type ShellLabelsColumnSearchProps = ComponentProps<"form"> & {
  inputProps?: Omit<
    ComponentProps<typeof SidebarInput>,
    "id" | "type" | "name" | "aria-describedby"
  >
}

/** Search field at the top of the labels column (submit suppressed until wired). */
export function ShellLabelsColumnSearch({
  className,
  inputProps,
  onSubmit,
  ...props
}: ShellLabelsColumnSearchProps) {
  const { t } = useTranslation("shell")
  const reactId = useId()
  const inputId = `shell-sidebar-search-${reactId}`

  return (
    <form
      {...props}
      role="search"
      className={cn("shrink-0 px-2 pt-2 pb-1", className)}
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit?.(event)
      }}
    >
      <SidebarGroup className="py-0">
        <SidebarGroupContent>
          <Label htmlFor={inputId} className="sr-only">
            {t("nav.search")}
          </Label>

          <div className="relative w-full min-w-0">
            <SidebarInput
              id={inputId}
              type="search"
              name={SHELL_SIDEBAR_SEARCH_FIELD_NAME}
              placeholder={t("nav.search_placeholder")}
              autoComplete="off"
              {...inputProps}
              className={cn("pl-8 pr-2", inputProps?.className)}
            />

            <Search
              className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 select-none opacity-50"
              aria-hidden
            />
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    </form>
  )
}
