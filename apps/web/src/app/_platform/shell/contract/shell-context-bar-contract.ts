import type { ShellIconName } from "../constants/shell-icon-names"

export type ShellContextBarVisibility = "always" | "desktop-only"

export type ShellContextBarTargetKind = "link" | "command"

export interface ShellContextBarTabDescriptor {
  id: string
  labelKey: string
  kind: ShellContextBarTargetKind
  to?: string
  commandId?: string
  badgeCount?: number
  visibility?: ShellContextBarVisibility
  disabled?: boolean
}

export interface ShellContextBarMenuItemDescriptor {
  id: string
  labelKey: string
  kind: ShellContextBarTargetKind
  to?: string
  commandId?: string
  disabled?: boolean
}

export type ShellContextBarActionPresentation = "icon" | "button" | "menu"

export interface ShellContextBarActionDescriptor {
  id: string
  labelKey: string
  presentation: ShellContextBarActionPresentation
  kind?: ShellContextBarTargetKind
  to?: string
  commandId?: string
  iconName?: ShellIconName
  menuItems?: readonly ShellContextBarMenuItemDescriptor[]
  group?: string
  visibility?: ShellContextBarVisibility
  disabled?: boolean
}

export interface ShellContextBarDescriptor {
  tabs: readonly ShellContextBarTabDescriptor[]
  actions?: readonly ShellContextBarActionDescriptor[]
}

export interface ShellContextBarResolvedTab {
  id: string
  labelKey: string
  label: string
  kind: ShellContextBarTargetKind
  to?: string
  commandId?: string
  badgeCount?: number
  visibility: ShellContextBarVisibility
  disabled: boolean
  isActive: boolean
}

export interface ShellContextBarResolvedMenuItem {
  id: string
  labelKey: string
  label: string
  kind: ShellContextBarTargetKind
  to?: string
  commandId?: string
  disabled: boolean
}

export type ShellContextBarResolvedAction =
  | {
      id: string
      labelKey: string
      label: string
      presentation: "icon" | "button"
      kind: ShellContextBarTargetKind
      to?: string
      commandId?: string
      iconName?: ShellIconName
      group?: string
      visibility: ShellContextBarVisibility
      disabled: boolean
    }
  | {
      id: string
      labelKey: string
      label: string
      presentation: "menu"
      menuItems: readonly ShellContextBarResolvedMenuItem[]
      group?: string
      visibility: ShellContextBarVisibility
      disabled: boolean
    }

export interface ShellContextBarResolvedModel {
  tabs: readonly ShellContextBarResolvedTab[]
  actions: readonly ShellContextBarResolvedAction[]
}

export interface ResolveShellContextBarOptions {
  contextBar: ShellContextBarDescriptor
  pathname: string
  translate: (labelKey: string) => string
}
