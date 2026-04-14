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
} from "@afenda/design-system/ui-primitives"

export function ShellTopNavConnectPopover() {
  const { t } = useTranslation("shell")
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 gap-1.5 rounded-full border-border/70 bg-background/70 px-3.5 text-foreground transition-colors hover:border-border hover:bg-accent/30"
        >
          <Plug className="size-3.5 opacity-80" aria-hidden />
          <span className="text-sm">{t("top_nav.connect")}</span>
        </Button>
      </PopoverTrigger>
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
              <ChevronsUpDown className="size-3.5 opacity-60" aria-hidden />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="space-y-2 px-3 pb-3">
              <p className="font-mono text-xs text-muted-foreground break-all">
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
