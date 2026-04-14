/**
 * Label for the primary modifier key in shortcut hints (palette / search).
 */
export function useShellTopNavModKey(): "⌘" | "Ctrl" {
  if (typeof navigator === "undefined") return "Ctrl"
  return /Mac|iPhone|iPod|iPad/i.test(navigator.platform) ? "⌘" : "Ctrl"
}
