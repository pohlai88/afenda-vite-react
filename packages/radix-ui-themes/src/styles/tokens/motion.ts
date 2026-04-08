export const AFENDA_MOTION_DURATIONS = {
  fast: '100ms',
  normal: '200ms',
  slow: '350ms',
} as const

export const AFENDA_MOTION_EASING = {
  out: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  inOut: 'cubic-bezier(0.45, 0, 0.55, 1)',
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
} as const
