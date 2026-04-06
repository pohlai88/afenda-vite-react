import { useCallback } from 'react'
import { MoonIcon, SunIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@afenda/ui/components/ui/button'
import { cn } from '@afenda/ui/lib/utils'

import { useAppShellStore } from '@/share/state/use-app-shell-store'

export interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { t } = useTranslation('shell')
  const theme = useAppShellStore((state) => state.theme)
  const setTheme = useAppShellStore((state) => state.setTheme)

  const toggleLabel = t('theme.toggle', 'Toggle theme')

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }, [theme, setTheme])

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={toggleLabel}
      aria-pressed={theme === 'dark'}
      title={toggleLabel}
      className={cn('size-8', className)}
    >
      {theme === 'light' ? (
        <SunIcon className="size-4" aria-hidden="true" />
      ) : (
        <MoonIcon className="size-4" aria-hidden="true" />
      )}
    </Button>
  )
}
