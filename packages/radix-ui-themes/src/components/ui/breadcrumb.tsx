import { Slot } from '@radix-ui/react-slot'
import { ChevronRight, MoreHorizontal } from 'lucide-react'
import { cn } from '../../lib/utils/cn.js'
import { defaultTheme } from '../../lib/theme/defaultTheme.js'

export const Breadcrumb = ({ ...props }: React.ComponentProps<'nav'>) => <nav aria-label="breadcrumb" {...props} />
export const BreadcrumbList = ({ className, ...props }: React.ComponentProps<'ol'>) => (
  <ol className={cn('flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground break-words', className)} {...props} />
)
export const BreadcrumbItem = ({ className, ...props }: React.ComponentProps<'li'>) => (
  <li className={cn('inline-flex items-center gap-1.5', className)} {...props} />
)
export const BreadcrumbLink = ({ asChild, className, ...props }: React.ComponentProps<'a'> & { asChild?: boolean }) => {
  const Comp = asChild ? Slot : 'a'
  return <Comp className={cn('transition-colors hover:text-foreground', className)} {...props} />
}
export const BreadcrumbPage = ({ className, ...props }: React.ComponentProps<'span'>) => (
  <span className={cn(defaultTheme.nav.breadcrumb, 'font-normal text-foreground', className)} role="link" aria-disabled="true" aria-current="page" {...props} />
)
export const BreadcrumbSeparator = ({ children, className, ...props }: React.ComponentProps<'li'>) => (
  <li role="presentation" aria-hidden="true" className={cn('[&>svg]:h-3.5 [&>svg]:w-3.5', className)} {...props}>
    {children ?? <ChevronRight />}
  </li>
)
export const BreadcrumbEllipsis = ({ className, ...props }: React.ComponentProps<'span'>) => (
  <span role="presentation" aria-hidden="true" className={cn('flex h-9 w-9 items-center justify-center', className)} {...props}>
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More</span>
  </span>
)
