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

import { SHELL_TOP_NAV_ICON_BUTTON_CLASS } from "./shell-top-nav-tools"

export function ShellTopNavConnectPopover() {
  const { t } = useTranslation("shell")
  const connectTooltip = t("top_nav.tooltip_connect")

  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={SHELL_TOP_NAV_ICON_BUTTON_CLASS}
              aria-label={t("top_nav.connect_title")}
            >
              <Plug
                className="size-4 opacity-90"
                strokeWidth={1.5}
                aria-hidden
              />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          {connectTooltip}
        </TooltipContent>
      </Tooltip>
      <PopoverContent className="w-80 p-0" align="end">
        <PopoverHeader className="border-b border-border p-3">
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
            <div className="flex flex-col gap-2 px-3 pb-3">
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
