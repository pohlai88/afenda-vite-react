"use client"

import { useTranslation } from "react-i18next"
import { ChevronsUpDown, Plug } from "lucide-react"

import {
  Badge,
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@afenda/design-system/ui-primitives"

export function ShellTopNavConnectPopover() {
  const { t } = useTranslation("shell")
  const connectTooltip = t("top_nav.tooltip_connect")

  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center">
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-[2.25rem] gap-2 rounded-full border-border-muted bg-card/70 px-3.5 text-foreground shadow-sm transition-colors hover:border-border hover:bg-accent/55 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring has-[>svg]:px-3.5"
                aria-label={t("top_nav.connect_title")}
              >
                <Plug
                  className="size-4 shrink-0 opacity-80"
                  strokeWidth={1.5}
                  aria-hidden
                />
                <span className="text-sm leading-none">
                  {t("top_nav.connect")}
                </span>
              </Button>
            </PopoverTrigger>
          </span>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          {connectTooltip}
        </TooltipContent>
      </Tooltip>
      <PopoverContent className="w-[20rem] p-[0]" align="end">
        <PopoverHeader className="border-b border-border p-[0.75rem]">
          <PopoverTitle>{t("top_nav.connect_title")}</PopoverTitle>
          <PopoverDescription>
            {t("top_nav.connect_description")}
          </PopoverDescription>
        </PopoverHeader>
        <Collapsible className="border-b border-border">
          <CollapsibleTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              className="flex w-full justify-between rounded-none px-3 py-2 text-xs font-normal"
            >
              {t("top_nav.connect_details")}
              <ChevronsUpDown
                className="size-3.5 opacity-60"
                strokeWidth={1.5}
                aria-hidden
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="flex flex-col gap-[0.5rem] px-3 pb-3">
              <p className="font-mono text-xs break-all text-muted-foreground">
                {t("top_nav.connect_placeholder_url")}
              </p>
              <Badge variant="secondary" className="text-[10px]">
                {t("top_nav.read_only_hint")}
              </Badge>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </PopoverContent>
    </Popover>
  )
}
