/**
 * RESOLVE SHELL HEADER ACTIONS
 *
 * Pure resolver for route-owned shell header action metadata.
 * Converts declarative action descriptors into render-ready action items for
 * shell chrome consumers.
 *
 * Rules:
 * - emphasis defaults to `default`
 * - disabled state defaults to `false`
 * - labels are translated through the supplied translator
 * - path strings are trimmed/normalized for link actions
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
    id: action.id,
    labelKey: action.labelKey,
    label: options.translate(action.labelKey),
    kind: action.kind,
    to: action.kind === "link" ? normalizePath(action.to) : undefined,
    commandId: action.kind === "command" ? action.commandId?.trim() : undefined,
    icon: action.icon?.trim() || undefined,
    emphasis: action.emphasis ?? "default",
    isDisabled: action.isDisabled ?? false,
  }))
}
