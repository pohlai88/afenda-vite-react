/**
 * RESOLVE SHELL COMMAND MESSAGE
 *
 * Resolves user-facing message metadata for shell command outcomes using
 * command-specific and category-level fallbacks.
 */

import type { ShellCommandOutcomeCategory } from "../contract/shell-command-outcome-contract"
import type {
  ResolveShellCommandMessageOptions,
  ShellCommandMessageDescriptor,
} from "../contract/shell-command-message-contract"

const COMMAND_MESSAGE_CATALOG: Record<
  string,
  Partial<Record<ShellCommandOutcomeCategory, ShellCommandMessageDescriptor>>
> = {
  "dashboard.refresh": {
    completed: {
      messageKey: "command.dashboard.refresh.completed",
      fallbackMessage: "Dashboard refreshed successfully.",
    },
  },
  "orders.create": {
    completed: {
      messageKey: "command.orders.create.completed",
      fallbackMessage: "Order created successfully.",
    },
    validation_failed: {
      messageKey: "command.orders.create.validationFailed",
      fallbackMessage:
        "Order creation could not be completed because the input is invalid.",
    },
    unauthorized: {
      messageKey: "command.orders.create.unauthorized",
      fallbackMessage: "You are not allowed to create orders.",
    },
    conflict: {
      messageKey: "command.orders.create.conflict",
      fallbackMessage:
        "Order creation could not be completed because of a conflicting state.",
    },
  },
  "refresh-events-view": {
    completed: {
      messageKey: "command.refreshEventsView.completed",
      fallbackMessage: "Events view refreshed successfully.",
    },
  },
}

const CATEGORY_MESSAGE_CATALOG: Record<
  ShellCommandOutcomeCategory,
  ShellCommandMessageDescriptor
> = {
  completed: {
    messageKey: "command.generic.completed",
    fallbackMessage: "Action completed successfully.",
  },
  cancelled: {
    messageKey: "command.generic.cancelled",
    fallbackMessage: "Action was cancelled.",
  },
  unauthorized: {
    messageKey: "command.generic.unauthorized",
    fallbackMessage: "You are not allowed to perform this action.",
  },
  validation_failed: {
    messageKey: "command.generic.validationFailed",
    fallbackMessage:
      "The action could not be completed because the input is invalid.",
  },
  invariant_failed: {
    messageKey: "command.generic.invariantFailed",
    fallbackMessage: "The action violated a required system invariant.",
  },
  not_found: {
    messageKey: "command.generic.notFound",
    fallbackMessage: "The requested resource could not be found.",
  },
  conflict: {
    messageKey: "command.generic.conflict",
    fallbackMessage:
      "The action could not be completed because of a conflicting state.",
  },
  system_error: {
    messageKey: "command.generic.systemError",
    fallbackMessage: "An unexpected system error occurred.",
  },
}

export function resolveShellCommandMessage(
  options: ResolveShellCommandMessageOptions
): ShellCommandMessageDescriptor {
  const commandMessages = COMMAND_MESSAGE_CATALOG[options.commandId]
  const commandSpecific = commandMessages?.[options.category]

  if (commandSpecific) {
    return commandSpecific
  }

  return CATEGORY_MESSAGE_CATALOG[options.category]
}
