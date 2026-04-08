/**
 * RESPONSIBILITY ENVELOPE
 * File role: `block-ui/trigger` sub-barrel.
 * Owns: shell trigger blocks and their types (command palette, help, alerts, …).
 * Standard: re-export only; see `block-ui/RULES.md` and `shell-ui/RULES.md` for boundaries.
 */
export { CommandPaletteTrigger } from './command-palette-trigger'
export type { CommandPaletteTriggerProps } from './command-palette-trigger'
export { CreateActionTrigger } from './create-action-trigger'
export type {
  CreateAction,
  CreateActionItem,
  CreateActionSeparator,
  CreateActionTriggerProps,
} from './create-action-trigger'
export { FeedbackTrigger } from './feedback-trigger'
export type { FeedbackTriggerProps } from './feedback-trigger'
export { HelpTrigger } from './help-trigger'
export type { HelpTriggerProps } from './help-trigger'
export { MobileNavTrigger } from './mobile-nav-trigger'
export type { MobileNavTriggerProps } from './mobile-nav-trigger'
export { NotificationTrigger } from './notification-trigger'
export type { NotificationTriggerProps } from './notification-trigger'
export { ResolutionTrigger } from './resolution-trigger'
export type { ResolutionTriggerProps } from './resolution-trigger'
export { TruthAlertTrigger } from './truth-alert-trigger'
export type { TruthAlertTriggerProps } from './truth-alert-trigger'
