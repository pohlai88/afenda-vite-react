import { useCallback } from 'react'
import { MoonIcon, SunIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useTranslation } from 'react-i18next'

import { Button } from '@afenda/ui/components/ui/button'

export function ThemeToggle() {
  const { t } = useTranslation('shell')
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const toggleLabel = t('theme.toggle', 'Toggle theme')

  const toggleTheme = useCallback(() => {
    setTheme(isDark ? 'light' : 'dark')
  }, [isDark, setTheme])

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={toggleLabel}
      aria-pressed={isDark}
      title={toggleLabel}
      className="rounded-full"
    >
      {isDark ? (
        <MoonIcon aria-hidden="true" />
      ) : (
        <SunIcon aria-hidden="true" />
      )}
    </Button>
  )
}
