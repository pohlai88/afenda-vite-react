import type { HTMLAttributes, Ref } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils/cn.js'
import { defaultTheme } from '../../lib/theme/defaultTheme.js'

const badgeVariants = cva(defaultTheme.badge.base, {
  variants: {
    variant: defaultTheme.badge.variants,
  },
  defaultVariants: {
    variant: 'default',
  },
})

export interface BadgeProps
  extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {
  ref?: Ref<HTMLDivElement>
}

export function Badge({ className, variant, ref, ...props }: BadgeProps) {
  return (
    <div
      ref={ref}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}
