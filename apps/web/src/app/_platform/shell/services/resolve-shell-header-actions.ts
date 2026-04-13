/**
 * RESOLVE SHELL HEADER ACTIONS
 *
 * Pure resolver for shell header action descriptors.
 * Converts route-owned action metadata into render-ready shell action items.
 */

import type {
  ResolveShellHeaderActionsOptions,
  ShellHeaderActionResolvedItem,
} from "../contract/shell-header-action-contract"

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

export function resolveShellHeaderActions(
  options: ResolveShellHeaderActionsOptions
): ShellHeaderActionResolvedItem[] {
  return options.actions.map((action) => ({
    id: action.id.trim(),
    labelKey: action.labelKey.trim(),
    label: options.translate(action.labelKey.trim()),
    kind: action.kind,
    tone: action.tone ?? "default",
    visibility: action.visibility ?? "always",
    commandId:
      action.kind === "command"
        ? action.commandId?.trim() || undefined
        : undefined,
    to: action.kind === "link" ? normalizePath(action.to) : undefined,
    disabled: action.disabled ?? false,
  }))
}
