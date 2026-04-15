"use client"

import { Keyboard } from "lucide-react"
import { useTranslation } from "react-i18next"

import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
} from "@afenda/design-system/ui-primitives"

import { useCloseMobileSidebar } from "../hooks/use-close-mobile-sidebar"
import { dispatchOpenCommandPalette } from "../services/shell-command-palette-events"
import { useShellTopNavModKey } from "./shell-top-nav-block/use-shell-top-nav-mod-key"

export function ShellUserMenuQuickActions() {
  const { t } = useTranslation("shell")
  const closeMobileSidebar = useCloseMobileSidebar()
  const mod = useShellTopNavModKey()

  const openPalette = () => {
    closeMobileSidebar()
    dispatchOpenCommandPalette()
  }

  return (
    <>
      <DropdownMenuGroup>
        <DropdownMenuItem
          className="gap-[0.5rem]"
          onSelect={(e) => {
            e.preventDefault()
            openPalette()
          }}
        >
          <Keyboard className="size-4" />
          {t("user_menu.command_palette")}
          <DropdownMenuShortcut>{`${mod}+K`}</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
    </>
  )
}
