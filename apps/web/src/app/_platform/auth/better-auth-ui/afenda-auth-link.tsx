import type { PropsWithChildren } from "react"
import { Link as RouterLink } from "react-router-dom"

/**
 * Router `Link` compatible with Better Auth UI `Link` contract (`href` / optional `to`).
 */
export function AfendaAuthLink({
  className,
  href,
  to,
  children,
  ...rest
}: PropsWithChildren<{
  className?: string
  href: string
  to?: string
}>) {
  const target = to ?? href
  return (
    <RouterLink className={className} to={target} {...rest}>
      {children}
    </RouterLink>
  )
}
