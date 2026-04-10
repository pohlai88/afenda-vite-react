import { useEffect, type RefObject } from "react"

/**
 * Invokes `handler` when a pointer event occurs outside `ref.current`.
 * @see https://usehooks.com/useOnClickOutside/
 */
export function useOnClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T | null>,
  handler: (event: Event) => void,
): void {
  useEffect(() => {
    const listener = (event: Event) => {
      const el = ref.current
      if (!el || el.contains(event.target as Node)) {
        return
      }
      handler(event)
    }

    document.addEventListener("mousedown", listener)
    document.addEventListener("touchstart", listener)

    return () => {
      document.removeEventListener("mousedown", listener)
      document.removeEventListener("touchstart", listener)
    }
  }, [ref, handler])
}
