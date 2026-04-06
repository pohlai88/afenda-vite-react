/**
 * RESPONSIBILITY ENVELOPE
 * File role: `block-ui` public API barrel.
 * Owns: composed blocks (`brand-title-block`, `shell-title-block`), `trigger/`, `switch-toggle/`.
 * Standard: components + `export type` for props and shared types; see `block-ui/RULES.md`.
 * Must not own: navigation composites, shell primitives, or feature-only UI.
 * Related: `switch-toggle/index.ts`, `trigger/index.ts`.
 */
export { BrandTitleBlock } from './brand-title-block'
export type { BrandTitleBlockProps } from './brand-title-block'
export { ShellTitleBlock } from './shell-title-block'
export type { ShellTitleBlockProps } from './shell-title-block'

export { ScopeSwitcher, ThemeToggle } from './switch-toggle'
export type {
  ScopeSwitcherGroup,
  ScopeSwitcherItem,
  ScopeSwitcherProps,
  ThemeToggleProps,
} from './switch-toggle'

export {
  CommandPaletteTrigger,
  CreateActionTrigger,
  FeedbackTrigger,
  HelpTrigger,
  NotificationTrigger,
  ResolutionTrigger,
  TruthAlertTrigger,
} from './trigger'
export type {
  CommandPaletteTriggerProps,
  CreateAction,
  CreateActionItem,
  CreateActionSeparator,
  CreateActionTriggerProps,
  FeedbackTriggerProps,
  HelpTriggerProps,
  NotificationTriggerProps,
  ResolutionTriggerProps,
  TruthAlertTriggerProps,
} from './trigger'
