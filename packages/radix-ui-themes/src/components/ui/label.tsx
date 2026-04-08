import type { Ref } from 'react'
import * as LabelPrimitive from '@radix-ui/react-label'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils/cn.js'

const labelVariants = cva('text-sm font-medium text-foreground leading-none peer-disabled:opacity-70')

export interface LabelProps
  extends LabelPrimitive.LabelProps,
    VariantProps<typeof labelVariants> {
  ref?: Ref<HTMLLabelElement>
}

export function Label({ className, ref, ...props }: LabelProps) {
  return <LabelPrimitive.Root ref={ref} className={cn(labelVariants(), className)} {...props} />
}
