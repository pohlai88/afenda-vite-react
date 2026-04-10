import { CircleDotIcon, PanelLeftIcon } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Button } from "@afenda/shadcn-ui/components/ui/button"
import { Label } from "@afenda/shadcn-ui/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@afenda/shadcn-ui/components/ui/popover"
import {
  RadioGroup,
  RadioGroupItem,
} from "@afenda/shadcn-ui/components/ui/radio-group"
import {
  SidebarMenuButton,
  useSidebar,
} from "@afenda/shadcn-ui/components/ui/sidebar"
import { cn } from "@afenda/shadcn-ui/lib/utils"

import { type SidebarMode, useAppShellStore } from "@/share/client-store"

import { dashboardSidebarMenuButtonClassName } from "./dashboard-sidebar-tokens"

export interface SideNavTriggerProps {
  variant?: "icon" | "menu"
  className?: string
}

/**
 * Sidebar control trigger — opens a popover to select one of three modes:
 *
 * - **Expanded**       — sidebar always visible at full width
 * - **Collapsed**      — sidebar collapses to icon-only rail
 * - **Expand on hover** — icon-only at rest; expands while the cursor is inside
 *
 * The selected mode is persisted in `useAppShellStore` so it survives reload.
 * The `PopoverTrigger` owns the click interaction; no secondary toggle on the
 * button itself (avoids the open-and-immediately-toggle conflict).
 */
export function SideNavTrigger({
  variant = "icon",
  className,
}: SideNavTriggerProps) {
  const { t } = useTranslation("shell")
  const { isMobile } = useSidebar()
  const sidebarMode = useAppShellStore((s) => s.sidebarMode)
  const setSidebarMode = useAppShellStore((s) => s.setSidebarMode)
  const controlLabel = t("sidebar.control_title" as never, {
    defaultValue: "Sidebar",
  })

  const options: { value: SidebarMode; label: string }[] = [
    {
      value: "expanded",
      label: t("sidebar.mode_expanded" as never, { defaultValue: "Expanded" }),
    },
    {
      value: "collapsed",
      label: t("sidebar.mode_collapsed" as never, {
        defaultValue: "Collapsed",
      }),
    },
    {
      value: "hover",
      label: t("sidebar.mode_hover" as never, {
        defaultValue: "Expand on hover",
      }),
    },
  ]

  const trigger =
    variant === "menu" ? (
      <SidebarMenuButton
        tooltip={controlLabel}
        className={cn(
          dashboardSidebarMenuButtonClassName,
          "justify-start group-data-[collapsible=icon]:justify-center",
          "group-data-[collapsible=icon]:[&_span]:sr-only",
          className
        )}
      >
        <PanelLeftIcon aria-hidden />
        <span>{controlLabel}</span>
      </SidebarMenuButton>
    ) : (
      <Button
        variant="ghost"
        size="icon"
        className={className}
        aria-label={t("sidebar.toggle" as never, {
          defaultValue: "Toggle sidebar",
        })}
      >
        <PanelLeftIcon aria-hidden />
      </Button>
    )

  return (
    <Popover>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        align={variant === "menu" ? "end" : "start"}
        side={variant === "menu" && !isMobile ? "right" : "bottom"}
        className="w-52"
      >
        <div className="grid gap-3">
          <p className="text-sm leading-none font-medium">{controlLabel}</p>
          <RadioGroup
            value={sidebarMode}
            onValueChange={(v) => setSidebarMode(v as SidebarMode)}
          >
            {options.map((opt) => (
              <div key={opt.value} className="flex items-center gap-2">
                <RadioGroupItem value={opt.value} id={`sidebar-${opt.value}`} />
                <Label
                  htmlFor={`sidebar-${opt.value}`}
                  className="flex flex-1 items-center justify-between gap-2"
                >
                  {opt.label}
                  {opt.value === "hover" ? (
                    <CircleDotIcon
                      aria-hidden
                      className="text-muted-foreground"
                    />
                  ) : null}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </PopoverContent>
    </Popover>
  )
}
