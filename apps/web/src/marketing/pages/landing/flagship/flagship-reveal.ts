import { MARKETING_EASE_OUT } from "../../_components"

export function getFlagshipHeroReveal(reduceMotion: boolean, delay = 0) {
  return {
    initial: reduceMotion ? false : { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: reduceMotion ? 0 : 0.78,
      delay,
      ease: MARKETING_EASE_OUT,
    },
  } as const
}

export function getFlagshipSectionReveal(reduceMotion: boolean, delay = 0) {
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
