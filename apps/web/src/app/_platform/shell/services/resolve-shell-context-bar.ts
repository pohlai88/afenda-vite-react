import type {
  ResolveShellContextBarOptions,
  ShellContextBarMenuItemDescriptor,
  ShellContextBarResolvedAction,
  ShellContextBarResolvedMenuItem,
  ShellContextBarResolvedModel,
  ShellContextBarResolvedTab,
  ShellContextBarTargetKind,
} from "../contract/shell-context-bar-contract"

function normalizePath(path: string | undefined): string | undefined {
  if (typeof path !== "string") {
    return undefined
  }
  const trimmed = path.trim()
  if (trimmed.length === 0) {
    return undefined
  }
  if (trimmed.length > 1) {
    return trimmed.replace(/\/+$/, "")
  }
  return trimmed
}

function normalizePathname(pathname: string): string {
  return normalizePath(pathname) ?? "/"
}

function normalizeCommandId(commandId: string | undefined): string | undefined {
  if (typeof commandId !== "string") {
    return undefined
  }
  const trimmed = commandId.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

function normalizeVisibility(visibility: unknown): "always" | "desktop-only" {
  return visibility === "desktop-only" ? "desktop-only" : "always"
}

function normalizeTarget(
  kind: ShellContextBarTargetKind,
  to: string | undefined,
  commandId: string | undefined
): Pick<ShellContextBarResolvedTab, "to" | "commandId"> {
  if (kind === "link") {
    return {
      to: normalizePath(to),
      commandId: undefined,
    }
  }
  return {
    to: undefined,
    commandId: normalizeCommandId(commandId),
  }
}

function resolveTabIsActive(
  kind: ShellContextBarTargetKind,
  to: string | undefined,
  pathname: string
): boolean {
  if (kind !== "link") {
    return false
  }
  return normalizePath(to) === pathname
}

function resolveMenuItems(
  menuItems: readonly ShellContextBarMenuItemDescriptor[] | undefined,
  translate: ResolveShellContextBarOptions["translate"]
): ShellContextBarResolvedMenuItem[] {
  if (menuItems === undefined) {
    return []
  }
  return menuItems.map((item) => {
    const kind = item.kind
    const target = normalizeTarget(kind, item.to, item.commandId)

    return {
      id: item.id.trim(),
      labelKey: item.labelKey.trim(),
      label: translate(item.labelKey.trim()),
      kind,
      to: target.to,
      commandId: target.commandId,
      disabled: item.disabled ?? false,
    }
  })
}

export function resolveShellContextBar(
  options: ResolveShellContextBarOptions
): ShellContextBarResolvedModel {
  const pathname = normalizePathname(options.pathname)

  const tabs: ShellContextBarResolvedTab[] = options.contextBar.tabs.map(
    (tab) => {
      const kind = tab.kind
      const target = normalizeTarget(kind, tab.to, tab.commandId)

      return {
        id: tab.id.trim(),
        labelKey: tab.labelKey.trim(),
        label: options.translate(tab.labelKey.trim()),
        kind,
        to: target.to,
        commandId: target.commandId,
        badgeCount: tab.badgeCount,
        visibility: normalizeVisibility(tab.visibility),
        disabled: tab.disabled ?? false,
        isActive: resolveTabIsActive(kind, target.to, pathname),
      }
    }
  )

  const actions: ShellContextBarResolvedAction[] = (
    options.contextBar.actions ?? []
  ).map((action) => {
    const visibility = normalizeVisibility(action.visibility)

    if (action.presentation === "menu") {
      return {
        id: action.id.trim(),
        labelKey: action.labelKey.trim(),
        label: options.translate(action.labelKey.trim()),
        presentation: "menu",
        menuItems: resolveMenuItems(action.menuItems, options.translate),
        group: action.group,
        visibility,
        disabled: action.disabled ?? false,
      }
    }

    const kind = action.kind as ShellContextBarTargetKind
    const target = normalizeTarget(kind, action.to, action.commandId)

    return {
      id: action.id.trim(),
      labelKey: action.labelKey.trim(),
      label: options.translate(action.labelKey.trim()),
      presentation: action.presentation,
      kind,
      to: target.to,
      commandId: target.commandId,
      iconName: action.iconName,
      group: action.group,
      visibility,
      disabled: action.disabled ?? false,
    }
  })

  return {
    tabs,
    actions,
  }
}
