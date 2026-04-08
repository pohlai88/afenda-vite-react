/**
 * RESPONSIBILITY ENVELOPE
 * File role: `block-ui` public API barrel.
 * Owns: composed blocks (`brand-title-block`, `shell-title-block`), `panel/`, `trigger/`, `switch-toggle/`.
 * Standard: components + `export type` for props and shared types; see `block-ui/RULES.md`.
 * Must not own: navigation composites, shell primitives, or feature-only UI.
 * Related: `panel/index.ts`, `switch-toggle/index.ts`, `trigger/index.ts`.
 */
export { BrandTitleBlock } from './brand-title-block'
export type { BrandTitleBlockProps } from './brand-title-block'
export { ShellTitleBlock } from './shell-title-block'
export type { ShellTitleBlockProps } from './shell-title-block'
export { getTruthSeverityPresentation } from '@afenda/shadcn-ui/semantic'
export type { TruthSeverityPresentation } from '@afenda/shadcn-ui/semantic'

export {
  FeedbackPopover,
  HelpPanel,
  ResolutionPanel,
  TruthAlertPanel,
} from './panel'
export type {
  FeedbackPopoverProps,
  HelpPanelProps,
  ResolutionPanelProps,
  TruthAlertPanelProps,
} from './panel'

export { ScopeSwitcher, ThemeToggle } from './switch-toggle'
export type {
  ScopeSwitcherGroup,
  ScopeSwitcherItem,
  ScopeSwitcherProps,
} from './switch-toggle'

export {
  CommandPaletteTrigger,
  CreateActionTrigger,
  FeedbackTrigger,
  HelpTrigger,
  MobileNavTrigger,
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
  MobileNavTriggerProps,
  NotificationTriggerProps,
  ResolutionTriggerProps,
  TruthAlertTriggerProps,
} from './trigger'
