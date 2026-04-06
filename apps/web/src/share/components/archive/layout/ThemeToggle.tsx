import { memo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@afenda/ui/components/ui/button'
import { MoonIcon, SunIcon } from 'lucide-react'
import { useAppShellStore } from '@/share/state/use-app-shell-store'

export const ThemeToggle = memo(function ThemeToggle() {
  const { t } = useTranslation('shell')
  const theme = useAppShellStore((s) => s.theme)
  const setTheme = useAppShellStore((s) => s.setTheme)

  const toggle = useCallback(() => {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    document.documentElement.classList.toggle('dark', next === 'dark')
  }, [theme, setTheme])

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label={t('theme.toggle')}
      className="size-8"
    >
      {theme === 'light' ? (
        <SunIcon className="size-4" />
      ) : (
        <MoonIcon className="size-4" />
      )}
    </Button>
  )
})
