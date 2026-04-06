import type * as React from 'react'
import { AccessibleIcon as AccessibleIconPrimitive } from 'radix-ui'

function AccessibleIcon({
  ...props
}: React.ComponentProps<typeof AccessibleIconPrimitive.Root>) {
  return <AccessibleIconPrimitive.Root data-slot="accessible-icon" {...props} />
}

export { AccessibleIcon }
