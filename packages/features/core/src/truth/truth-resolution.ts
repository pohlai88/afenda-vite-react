/**
 * TruthResolution describes how an invariant failure or warning can be resolved.
 * The UI uses this to know HOW to resolve, not just that resolution is available.
 */
export interface TruthResolution {
  /** Resolution identifier for lookup and tracking */
  readonly key: string
  /**
   * Resolution type:
   * - auto: System can resolve without user input (e.g., auto-correct rounding)
   * - manual: User must take explicit action (e.g., enter missing FX rate)
   * - assisted: AI/system suggests, user confirms (e.g., match suggestion)
   */
  readonly type: 'auto' | 'manual' | 'assisted'
  /** Path to resolution action (route or command) */
  readonly actionPath?: string
}
