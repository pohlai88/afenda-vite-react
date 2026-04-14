import { shellIconNames } from "../constants/shell-icon-names"
import type { ShellContextBarDescriptor } from "../contract/shell-context-bar-contract"

export interface ShellContextBarValidationIssue {
  code:
    | "SHELL_CONTEXT_BAR_TABS_REQUIRED"
    | "SHELL_CONTEXT_BAR_TAB_INVALID_ID"
    | "SHELL_CONTEXT_BAR_TAB_DUPLICATE_ID"
    | "SHELL_CONTEXT_BAR_TAB_INVALID_LABEL_KEY"
    | "SHELL_CONTEXT_BAR_TAB_INVALID_KIND"
    | "SHELL_CONTEXT_BAR_TAB_MISSING_LINK_TARGET"
    | "SHELL_CONTEXT_BAR_TAB_MISSING_COMMAND_ID"
    | "SHELL_CONTEXT_BAR_TAB_INVALID_LINK_CONFIGURATION"
    | "SHELL_CONTEXT_BAR_TAB_INVALID_COMMAND_CONFIGURATION"
    | "SHELL_CONTEXT_BAR_TAB_INVALID_BADGE"
    | "SHELL_CONTEXT_BAR_ACTION_INVALID_ID"
    | "SHELL_CONTEXT_BAR_ACTION_DUPLICATE_ID"
    | "SHELL_CONTEXT_BAR_ACTION_INVALID_LABEL_KEY"
    | "SHELL_CONTEXT_BAR_ACTION_INVALID_PRESENTATION"
    | "SHELL_CONTEXT_BAR_ACTION_INVALID_KIND"
    | "SHELL_CONTEXT_BAR_ACTION_MISSING_LINK_TARGET"
    | "SHELL_CONTEXT_BAR_ACTION_MISSING_COMMAND_ID"
    | "SHELL_CONTEXT_BAR_ACTION_INVALID_LINK_CONFIGURATION"
    | "SHELL_CONTEXT_BAR_ACTION_INVALID_COMMAND_CONFIGURATION"
    | "SHELL_CONTEXT_BAR_ACTION_ICON_REQUIRED"
    | "SHELL_CONTEXT_BAR_ACTION_ICON_INVALID"
    | "SHELL_CONTEXT_BAR_ACTION_MENU_ITEMS_REQUIRED"
    | "SHELL_CONTEXT_BAR_ACTION_MENU_INVALID_CONFIGURATION"
    | "SHELL_CONTEXT_BAR_MENU_ITEM_INVALID_ID"
    | "SHELL_CONTEXT_BAR_MENU_ITEM_DUPLICATE_ID"
    | "SHELL_CONTEXT_BAR_MENU_ITEM_INVALID_LABEL_KEY"
    | "SHELL_CONTEXT_BAR_MENU_ITEM_INVALID_KIND"
    | "SHELL_CONTEXT_BAR_MENU_ITEM_MISSING_LINK_TARGET"
    | "SHELL_CONTEXT_BAR_MENU_ITEM_MISSING_COMMAND_ID"
    | "SHELL_CONTEXT_BAR_MENU_ITEM_INVALID_LINK_CONFIGURATION"
    | "SHELL_CONTEXT_BAR_MENU_ITEM_INVALID_COMMAND_CONFIGURATION"
  message: string
  path: string
}

function normalizeTo(path: string | undefined): string | undefined {
  if (typeof path !== "string") {
    return undefined
  }
  const trimmed = path.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

function normalizeCommandId(commandId: string | undefined): string | undefined {
  if (typeof commandId !== "string") {
    return undefined
  }
  const trimmed = commandId.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

function isVisibilityValid(value: unknown): boolean {
  return value === undefined || value === "always" || value === "desktop-only"
}

export function validateShellContextBar(
  contextBar: ShellContextBarDescriptor
): ShellContextBarValidationIssue[] {
  const issues: ShellContextBarValidationIssue[] = []

  if (contextBar.tabs.length === 0) {
    issues.push({
      code: "SHELL_CONTEXT_BAR_TABS_REQUIRED",
      message: "Context bar requires at least one tab.",
      path: "contextBar.tabs",
    })
  }

  const seenTabIds = new Set<string>()
  for (const [index, tab] of contextBar.tabs.entries()) {
    const basePath = `contextBar.tabs[${index}]`
    const normalizedId = tab.id.trim()
    const normalizedLabelKey = tab.labelKey.trim()
    const normalizedTo = normalizeTo(tab.to)
    const normalizedCommandId = normalizeCommandId(tab.commandId)

    if (normalizedId.length === 0) {
      issues.push({
        code: "SHELL_CONTEXT_BAR_TAB_INVALID_ID",
        message: "Context bar tab id must not be empty.",
        path: `${basePath}.id`,
      })
    } else if (seenTabIds.has(normalizedId)) {
      issues.push({
        code: "SHELL_CONTEXT_BAR_TAB_DUPLICATE_ID",
        message: `Duplicate context bar tab id "${normalizedId}" detected.`,
        path: `${basePath}.id`,
      })
    } else {
      seenTabIds.add(normalizedId)
    }

    if (normalizedLabelKey.length === 0) {
      issues.push({
        code: "SHELL_CONTEXT_BAR_TAB_INVALID_LABEL_KEY",
        message: "Context bar tab labelKey must not be empty.",
        path: `${basePath}.labelKey`,
      })
    }

    if (tab.kind !== "link" && tab.kind !== "command") {
      issues.push({
        code: "SHELL_CONTEXT_BAR_TAB_INVALID_KIND",
        message: `Unsupported context bar tab kind "${String(tab.kind)}".`,
        path: `${basePath}.kind`,
      })
    } else if (tab.kind === "link") {
      if (!normalizedTo) {
        issues.push({
          code: "SHELL_CONTEXT_BAR_TAB_MISSING_LINK_TARGET",
          message: 'Context bar link tab requires a non-empty "to".',
          path: `${basePath}.to`,
        })
      }
      if (normalizedCommandId) {
        issues.push({
          code: "SHELL_CONTEXT_BAR_TAB_INVALID_LINK_CONFIGURATION",
          message: 'Context bar link tab must not define "commandId".',
          path: `${basePath}.commandId`,
        })
      }
    } else {
      if (!normalizedCommandId) {
        issues.push({
          code: "SHELL_CONTEXT_BAR_TAB_MISSING_COMMAND_ID",
          message: 'Context bar command tab requires a non-empty "commandId".',
          path: `${basePath}.commandId`,
        })
      }
      if (normalizedTo) {
        issues.push({
          code: "SHELL_CONTEXT_BAR_TAB_INVALID_COMMAND_CONFIGURATION",
          message: 'Context bar command tab must not define "to".',
          path: `${basePath}.to`,
        })
      }
    }

    if (
      tab.badgeCount !== undefined &&
      (!Number.isInteger(tab.badgeCount) || tab.badgeCount < 0)
    ) {
      issues.push({
        code: "SHELL_CONTEXT_BAR_TAB_INVALID_BADGE",
        message: "Context bar tab badgeCount must be a non-negative integer.",
        path: `${basePath}.badgeCount`,
      })
    }

    if (!isVisibilityValid(tab.visibility)) {
      issues.push({
        code: "SHELL_CONTEXT_BAR_TAB_INVALID_KIND",
        message: `Unsupported context bar tab visibility "${String(tab.visibility)}".`,
        path: `${basePath}.visibility`,
      })
    }
  }

  const seenActionIds = new Set<string>()
  for (const [index, action] of (contextBar.actions ?? []).entries()) {
    const basePath = `contextBar.actions[${index}]`
    const normalizedId = action.id.trim()
    const normalizedLabelKey = action.labelKey.trim()
    const normalizedTo = normalizeTo(action.to)
    const normalizedCommandId = normalizeCommandId(action.commandId)
    const normalizedIcon = action.iconName?.trim()

    if (normalizedId.length === 0) {
      issues.push({
        code: "SHELL_CONTEXT_BAR_ACTION_INVALID_ID",
        message: "Context bar action id must not be empty.",
        path: `${basePath}.id`,
      })
    } else if (seenActionIds.has(normalizedId)) {
      issues.push({
        code: "SHELL_CONTEXT_BAR_ACTION_DUPLICATE_ID",
        message: `Duplicate context bar action id "${normalizedId}" detected.`,
        path: `${basePath}.id`,
      })
    } else {
      seenActionIds.add(normalizedId)
    }

    if (normalizedLabelKey.length === 0) {
      issues.push({
        code: "SHELL_CONTEXT_BAR_ACTION_INVALID_LABEL_KEY",
        message: "Context bar action labelKey must not be empty.",
        path: `${basePath}.labelKey`,
      })
    }

    if (
      action.presentation !== "icon" &&
      action.presentation !== "button" &&
      action.presentation !== "menu"
    ) {
      issues.push({
        code: "SHELL_CONTEXT_BAR_ACTION_INVALID_PRESENTATION",
        message: `Unsupported context bar action presentation "${String(action.presentation)}".`,
        path: `${basePath}.presentation`,
      })
      continue
    }

    if (!isVisibilityValid(action.visibility)) {
      issues.push({
        code: "SHELL_CONTEXT_BAR_ACTION_INVALID_PRESENTATION",
        message: `Unsupported context bar action visibility "${String(action.visibility)}".`,
        path: `${basePath}.visibility`,
      })
    }

    if (action.presentation === "menu") {
      if (action.kind !== undefined || normalizedTo || normalizedCommandId) {
        issues.push({
          code: "SHELL_CONTEXT_BAR_ACTION_MENU_INVALID_CONFIGURATION",
          message:
            "Menu context bar action must not define kind, to, or commandId on the action root.",
          path: basePath,
        })
      }

      if (!Array.isArray(action.menuItems) || action.menuItems.length === 0) {
        issues.push({
          code: "SHELL_CONTEXT_BAR_ACTION_MENU_ITEMS_REQUIRED",
          message:
            'Menu context bar action requires a non-empty "menuItems" list.',
          path: `${basePath}.menuItems`,
        })
        continue
      }

      const seenMenuItemIds = new Set<string>()
      for (const [menuIndex, item] of action.menuItems.entries()) {
        const itemPath = `${basePath}.menuItems[${menuIndex}]`
        const normalizedMenuId = item.id.trim()
        const normalizedMenuLabelKey = item.labelKey.trim()
        const normalizedMenuTo = normalizeTo(item.to)
        const normalizedMenuCommandId = normalizeCommandId(item.commandId)

        if (normalizedMenuId.length === 0) {
          issues.push({
            code: "SHELL_CONTEXT_BAR_MENU_ITEM_INVALID_ID",
            message: "Context bar menu item id must not be empty.",
            path: `${itemPath}.id`,
          })
        } else if (seenMenuItemIds.has(normalizedMenuId)) {
          issues.push({
            code: "SHELL_CONTEXT_BAR_MENU_ITEM_DUPLICATE_ID",
            message: `Duplicate context bar menu item id "${normalizedMenuId}" detected.`,
            path: `${itemPath}.id`,
          })
        } else {
          seenMenuItemIds.add(normalizedMenuId)
        }

        if (normalizedMenuLabelKey.length === 0) {
          issues.push({
            code: "SHELL_CONTEXT_BAR_MENU_ITEM_INVALID_LABEL_KEY",
            message: "Context bar menu item labelKey must not be empty.",
            path: `${itemPath}.labelKey`,
          })
        }

        if (item.kind !== "link" && item.kind !== "command") {
          issues.push({
            code: "SHELL_CONTEXT_BAR_MENU_ITEM_INVALID_KIND",
            message: `Unsupported context bar menu item kind "${String(item.kind)}".`,
            path: `${itemPath}.kind`,
          })
          continue
        }

        if (item.kind === "link") {
          if (!normalizedMenuTo) {
            issues.push({
              code: "SHELL_CONTEXT_BAR_MENU_ITEM_MISSING_LINK_TARGET",
              message: 'Context bar menu link item requires a non-empty "to".',
              path: `${itemPath}.to`,
            })
          }
          if (normalizedMenuCommandId) {
            issues.push({
              code: "SHELL_CONTEXT_BAR_MENU_ITEM_INVALID_LINK_CONFIGURATION",
              message:
                'Context bar menu link item must not define "commandId".',
              path: `${itemPath}.commandId`,
            })
          }
        }

        if (item.kind === "command") {
          if (!normalizedMenuCommandId) {
            issues.push({
              code: "SHELL_CONTEXT_BAR_MENU_ITEM_MISSING_COMMAND_ID",
              message:
                'Context bar menu command item requires a non-empty "commandId".',
              path: `${itemPath}.commandId`,
            })
          }
          if (normalizedMenuTo) {
            issues.push({
              code: "SHELL_CONTEXT_BAR_MENU_ITEM_INVALID_COMMAND_CONFIGURATION",
              message: 'Context bar menu command item must not define "to".',
              path: `${itemPath}.to`,
            })
          }
        }
      }

      continue
    }

    if (action.kind !== "link" && action.kind !== "command") {
      issues.push({
        code: "SHELL_CONTEXT_BAR_ACTION_INVALID_KIND",
        message: `Unsupported context bar action kind "${String(action.kind)}".`,
        path: `${basePath}.kind`,
      })
      continue
    }

    if (action.presentation === "icon" && !normalizedIcon) {
      issues.push({
        code: "SHELL_CONTEXT_BAR_ACTION_ICON_REQUIRED",
        message: 'Icon context bar action requires a non-empty "iconName".',
        path: `${basePath}.iconName`,
      })
    }

    if (
      normalizedIcon &&
      !shellIconNames.includes(
        normalizedIcon as (typeof shellIconNames)[number]
      )
    ) {
      issues.push({
        code: "SHELL_CONTEXT_BAR_ACTION_ICON_INVALID",
        message: `Unsupported context bar action icon "${normalizedIcon}".`,
        path: `${basePath}.iconName`,
      })
    }

    if (action.kind === "link") {
      if (!normalizedTo) {
        issues.push({
          code: "SHELL_CONTEXT_BAR_ACTION_MISSING_LINK_TARGET",
          message: 'Context bar link action requires a non-empty "to".',
          path: `${basePath}.to`,
        })
      }
      if (normalizedCommandId) {
        issues.push({
          code: "SHELL_CONTEXT_BAR_ACTION_INVALID_LINK_CONFIGURATION",
          message: 'Context bar link action must not define "commandId".',
          path: `${basePath}.commandId`,
        })
      }
    }

    if (action.kind === "command") {
      if (!normalizedCommandId) {
        issues.push({
          code: "SHELL_CONTEXT_BAR_ACTION_MISSING_COMMAND_ID",
          message:
            'Context bar command action requires a non-empty "commandId".',
          path: `${basePath}.commandId`,
        })
      }
      if (normalizedTo) {
        issues.push({
          code: "SHELL_CONTEXT_BAR_ACTION_INVALID_COMMAND_CONFIGURATION",
          message: 'Context bar command action must not define "to".',
          path: `${basePath}.to`,
        })
      }
    }
  }

  return issues
}
