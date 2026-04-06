import { memo, useMemo, Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@afenda/ui/components/ui/breadcrumb'
import { useShellContext } from './shell-context'

/** Typed wrapper so nav-data `string` keys satisfy the strict i18n union. */
function useShellT() {
  const { t } = useTranslation('shell')
  return t as (key: string, options?: Record<string, unknown>) => string
}

/**
 * Derives breadcrumb segments from the current pathname and merges overrides
 * from ShellContext.
 */
export const AppBreadcrumb = memo(function AppBreadcrumb() {
  const t = useShellT()
  const { pathname } = useLocation()
  const { meta } = useShellContext()

  const segments = useMemo(() => {
    const parts = pathname
      .replace(/^\/app\/?/, '')
      .split('/')
      .filter(Boolean)

    const routeSegments = parts.map((part, i) => {
      const href = `/app/${parts.slice(0, i + 1).join('/')}`
      const labelKey = `nav.${part}`
      const label = t(labelKey, { defaultValue: part })
      return { label, href }
    })

    if (meta.breadcrumbs?.length) {
      return [...routeSegments.slice(0, -1), ...meta.breadcrumbs]
    }
    return routeSegments
  }, [pathname, meta.breadcrumbs, t])

  if (segments.length === 0) return null

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/app/dashboard">{t('nav.breadcrumb_root')}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {segments.map((seg, i) => {
          const isLast = i === segments.length - 1
          return (
            <Fragment key={seg.href ?? seg.label}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{seg.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={seg.href ?? '#'}>{seg.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
})
