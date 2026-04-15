/**
 * Single motion rhythm for platform preview (layout, content, tap).
 */

export const PREVIEW_EASE = [0.22, 1, 0.36, 1] as const

export const previewMotion = {
  /** Role cards, scenario cards, stage shell layout */
  layout: {
    duration: 0.26,
    ease: PREVIEW_EASE,
  },
  /** Intro, teasers, rails, AnimatePresence content */
  content: {
    duration: 0.18,
    ease: PREVIEW_EASE,
  },
  /** Small badge / chip cross-fades */
  contentQuick: {
    duration: 0.16,
    ease: PREVIEW_EASE,
  },
  tap: { scale: 0.995 },
} as const
