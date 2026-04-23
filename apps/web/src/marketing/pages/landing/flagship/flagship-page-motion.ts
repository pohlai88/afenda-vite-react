/**
 * Flagship page motion policy.
 * Owns page-local reveal and transition helpers only.
 * Do not place section markup, copy, or page composition here.
 */
import { MARKETING_EASE_OUT } from "../../../components"

export function getMarketingPageSectionReveal(
  reduceMotion: boolean,
  delay = 0
) {
  return {
    initial: reduceMotion ? false : { opacity: 0, y: 14 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.22 },
    transition: {
      duration: reduceMotion ? 0 : 0.84,
      delay,
      ease: MARKETING_EASE_OUT,
    },
  } as const
}
