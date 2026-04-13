/**
 * APP SHELL HEADER ACTIONS
 *
 * Presentational shell header actions component.
 * This component renders resolved header action items only and does not own
 * metadata policy or action descriptor normalization.
 */

import type { ReactElement } from "react"
import { Link } from "react-router-dom"

import { Button } from "@afenda/design-system/ui-primitives"

import type { ShellHeaderActionResolvedItem } from "../contract/shell-header-action-contract"
import { useShellHeaderActions } from "../hooks/use-shell-header-actions"

export interface AppShellHeaderActionsProps {
  /** Runtime dispatch for `command` actions — `commandId` is a governed intent token, not a callback in metadata. */
  onCommandAction?: (commandId: string) => void
}

function mapEmphasisToVariant(
  emphasis: ShellHeaderActionResolvedItem["emphasis"]
): "default" | "secondary" {
  switch (emphasis) {
    case "primary":
      return "default"
    case "secondary":
      return "secondary"
    default:
      return "secondary"
  }
}

export function AppShellHeaderActions(
  props: AppShellHeaderActionsProps
): ReactElement | null {
  const actions = useShellHeaderActions()

  if (actions.length === 0) {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      {actions.map((action) => {
        const variant = mapEmphasisToVariant(action.emphasis)

        if (action.kind === "link" && action.to) {
          return (
            <Button
              key={action.id}
              asChild
              variant={variant}
              disabled={action.isDisabled}
            >
              <Link to={action.to}>{action.label}</Link>
            </Button>
          )
        }

        if (action.kind === "command" && action.commandId) {
          const commandId = action.commandId
          return (
            <Button
              key={action.id}
              type="button"
              variant={variant}
              disabled={action.isDisabled}
              onClick={() => props.onCommandAction?.(commandId)}
            >
              {action.label}
            </Button>
          )
        }

        return null
      })}
    </div>
  )
}
