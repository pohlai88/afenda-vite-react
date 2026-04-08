import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils/cn.js'

const sidebarVariants = cva('flex h-full flex-col border-r bg-background text-foreground', {
  variants: {
    side: {
      left: 'border-r',
      right: 'border-l',
    },
    size: {
      default: 'w-64',
      compact: 'w-16',
      wide: 'w-80',
    },
  },
  defaultVariants: {
    side: 'left',
    size: 'default',
  },
})

export function Sidebar({
  className,
  side,
  size,
  asChild = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof sidebarVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'aside'
  return <Comp className={cn(sidebarVariants({ side, size }), className)} {...props} />
}

export const SidebarHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('border-b p-4', className)} {...props} />
)
export const SidebarContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex-1 overflow-auto p-2', className)} {...props} />
)
export const SidebarFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('border-t p-2', className)} {...props} />
)
export const SidebarGroup = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('mb-4', className)} {...props} />
)
export const SidebarGroupLabel = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('px-2 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground', className)} {...props} />
)
export const SidebarMenu = ({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
  <ul className={cn('space-y-1', className)} {...props} />
)
export const SidebarMenuItem = ({ className, ...props }: React.LiHTMLAttributes<HTMLLIElement>) => (
  <li className={cn(className)} {...props} />
)
export const SidebarMenuButton = ({ className, asChild = false, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }) => {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      className={cn(
        'inline-flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
      {...props}
    />
  )
}
