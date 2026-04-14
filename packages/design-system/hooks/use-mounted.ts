import * as React from 'react'

/**
 * Returns `true` after the first client commit. Use for `next-themes` and other
 * client-only UI so SSR output matches the first client render (avoid hydration mismatches).
 */
export function useHasMounted(): boolean {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return mounted
}

/** @deprecated Prefer {@link useHasMounted} — same implementation. */
export const useMounted = useHasMounted
