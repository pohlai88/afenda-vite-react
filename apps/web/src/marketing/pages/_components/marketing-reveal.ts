export const MARKETING_EASE_OUT: [number, number, number, number] = [
  0.22, 1, 0.36, 1,
]

export function getMarketingReveal(reduceMotion: boolean, delay = 0) {
  return {
    initial: { opacity: 0, y: reduceMotion ? 0 : 18 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.22 },
    transition: { duration: 0.72, delay, ease: MARKETING_EASE_OUT },
  } as const
}
