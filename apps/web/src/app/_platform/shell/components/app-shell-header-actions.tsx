/**
 * APP SHELL HEADER ACTIONS
 *
 * Presentational renderer for resolved shell header actions.
 * Command actions use `useShellCommandRunner` + global activity (disable + loading).
 */

import type { ReactElement } from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"

import { Button } from "@afenda/design-system/ui-primitives"
import { cn } from "@afenda/design-system/utils"

import type { ShellHeaderActionResolvedItem } from "../contract/shell-header-action-contract"
import { useShellCommandActivity } from "../hooks/use-shell-command-activity"
import {
  type ShellCommandRunner,
  useShellCommandRunner,
} from "../hooks/use-shell-command-runner"
import { useShellHeaderActions } from "../hooks/use-shell-header-actions"

function HeaderCommandButton(props: {
  readonly commandId: string
  readonly disabled: boolean | undefined
  readonly variant: "default" | "secondary"
  readonly visibilityClass: string | undefined
  readonly label: string
  readonly runCommand: ShellCommandRunner
}): ReactElement {
  const { commandId, disabled, variant, visibilityClass, label, runCommand } =
    props
  const isRunning = useShellCommandActivity(commandId)
  const { t } = useTranslation("shell")

  return (
    <Button
      type="button"
      variant={variant}
      disabled={Boolean(disabled) || isRunning}
      aria-busy={isRunning}
      className={cn(visibilityClass)}
      onClick={() => {
        void runCommand({
          commandId,
          intent: "header-action",
        })
      }}
    >
      {isRunning ? t("actions.command_running") : label}
    </Button>
  )
}

function mapToneToVariant(
  tone: ShellHeaderActionResolvedItem["tone"]
): "default" | "secondary" {
  if (tone === "primary") {
    return "default"
  }

  return "secondary"
}

export function AppShellHeaderActions(): ReactElement | null {
  const actions = useShellHeaderActions()
  const runCommand = useShellCommandRunner()

  if (actions.length === 0) {
    return null
  }

  return (
    <div className="ui-shell-header-actions-row">
      {actions.map((action) => {
        const variant = mapToneToVariant(action.tone)
        const visibilityClass =
          action.visibility === "desktop-only"
            ? "ui-visible-desktop-only"
            : undefined

        if (action.kind === "link" && action.to) {
          return (
            <Button
              key={action.id}
              asChild
              variant={variant}
              disabled={action.disabled}
              className={cn(visibilityClass)}
            >
              <Link to={action.to}>{action.label}</Link>
            </Button>
          )
        }

        if (action.kind === "command" && action.commandId) {
          const commandId = action.commandId
          return (
            <HeaderCommandButton
              key={action.id}
              commandId={commandId}
              disabled={action.disabled}
              variant={variant}
              visibilityClass={visibilityClass}
              label={action.label}
              runCommand={runCommand}
            />
          )
        }

        return null
      })}
    </div>
  )
}
