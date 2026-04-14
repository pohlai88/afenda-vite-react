/**
 * Modifier key label for command-palette shortcut hints in the shell chrome.
 * Display uses **⌘** universally; key listeners still accept **Ctrl+K** on non-Mac (`metaKey` / `ctrlKey`).
 */
export function useShellTopNavModKey(): "⌘" {
  return "⌘"
}
