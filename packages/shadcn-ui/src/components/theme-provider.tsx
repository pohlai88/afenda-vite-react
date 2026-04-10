/**
 * RUNTIME PROVIDER — theme-provider
 * Provides runtime theme state and browser persistence for package consumers.
 * Scope: handles trusted theme state inside React and parses persisted browser values.
 * Runtime: treat storage input as untrusted and keep fallback behavior explicit.
 * Consumption: use `ThemeProvider` and `useTheme()` instead of duplicating theme state logic.
 * Boundaries: this is runtime infrastructure, not a semantic registry or policy file.
 * Changes: preserve provider contract and storage behavior intentionally.
 * Purpose: centralize theme runtime behavior in one reviewed provider.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react"

export type Theme = "dark" | "light" | "system"

type ResolvedTheme = "dark" | "light"

type ThemeProviderProps = {
  children: ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  /** Persisted preference: `system` follows OS light/dark. */
  theme: Theme
  setTheme: (theme: Theme) => void
  /** Effective light/dark after resolving `system` (and OS preference). */
  resolvedTheme: ResolvedTheme
}

function subscribePreferredColorScheme(onStoreChange: () => void): () => void {
  const mq = window.matchMedia("(prefers-color-scheme: dark)")
  mq.addEventListener("change", onStoreChange)
  return () => mq.removeEventListener("change", onStoreChange)
}

function getPreferredColorSchemeSnapshot(): ResolvedTheme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

function getPreferredColorSchemeServerSnapshot(): ResolvedTheme {
  return "light"
}

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(
  undefined
)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem(storageKey)
    if (stored === "dark" || stored === "light" || stored === "system") {
      return stored
    }
    return defaultTheme
  })

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove("light", "dark")

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"

      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])

  const setTheme = useCallback(
    (next: Theme) => {
      localStorage.setItem(storageKey, next)
      setThemeState(next)
    },
    [storageKey]
  )

  const systemResolved = useSyncExternalStore(
    subscribePreferredColorScheme,
    getPreferredColorSchemeSnapshot,
    getPreferredColorSchemeServerSnapshot
  )

  const resolvedTheme: ResolvedTheme =
    theme === "system" ? systemResolved : theme

  const value = useMemo(
    () => ({ theme, setTheme, resolvedTheme }),
    [theme, setTheme, resolvedTheme]
  )

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeProviderContext)

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }

  return context
}
