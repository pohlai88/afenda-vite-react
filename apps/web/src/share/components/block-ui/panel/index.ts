/**
 * RESPONSIBILITY ENVELOPE
 * File role: `block-ui/panel` public barrel.
 * Owns: composed shell panels/popovers paired with `block-ui/trigger/*` controls.
 * Standard: components + `export type` for props; see `block-ui/RULES.md`.
 * Must not own: nav bars, route models, or primitives in `shell-ui`.
 * Related: `../trigger/index.ts`, `../RULES.md`.
 */
export { FeedbackPopover } from './feedback-popover'
export type { FeedbackPopoverProps } from './feedback-popover'
export { HelpPanel } from './help-panel'
export type { HelpPanelProps } from './help-panel'
export { ResolutionPanel } from './resolution-panel'
export type { ResolutionPanelProps } from './resolution-panel'
