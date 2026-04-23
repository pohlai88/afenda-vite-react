"use client"

import { useTranslation } from "react-i18next"

import {
  DropdownMenuGroup,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@afenda/design-system/ui-primitives"

import { useShellMotion } from "../../theme"

export function ShellUserMenuAccessibility() {
  const { t } = useTranslation("shell")
  const [motion, setMotionPreference] = useShellMotion()

  return (
    <DropdownMenuGroup>
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>
          {t("user_menu.accessibility_motion")}
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent className="min-w-44">
          <DropdownMenuRadioGroup
            value={motion}
            onValueChange={(v) => {
              if (v === "system" || v === "reduce" || v === "allow") {
                setMotionPreference(v)
              }
            }}
          >
            <DropdownMenuRadioItem value="system">
              {t("user_menu.motion_system")}
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="reduce">
              {t("user_menu.motion_reduce")}
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="allow">
              {t("user_menu.motion_allow")}
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    </DropdownMenuGroup>
  )
}
