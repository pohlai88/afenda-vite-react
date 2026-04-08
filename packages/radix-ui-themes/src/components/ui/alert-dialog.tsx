/* eslint-disable react-refresh/only-export-components */
import type { Ref } from 'react'
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog'
import { cn } from '../../lib/utils/cn.js'
import { buttonVariants } from './button.js'

export const AlertDialog = AlertDialogPrimitive.Root
export const AlertDialogTrigger = AlertDialogPrimitive.Trigger
export const AlertDialogPortal = AlertDialogPrimitive.Portal

export function AlertDialogOverlay({
  className,
  ref,
  ...props
}: AlertDialogPrimitive.AlertDialogOverlayProps & { ref?: Ref<HTMLDivElement> }) {
  return <AlertDialogPrimitive.Overlay ref={ref} className={cn('fixed inset-0 z-50 bg-background/80 backdrop-blur-sm', className)} {...props} />
}

export function AlertDialogContent({
  className,
  ref,
  ...props
}: AlertDialogPrimitive.AlertDialogContentProps & { ref?: Ref<HTMLDivElement> }) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        ref={ref}
        className={cn('fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-background p-6 shadow-lg', className)}
        {...props}
      />
    </AlertDialogPortal>
  )
}

export function AlertDialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col space-y-2 text-center sm:text-left', className)} {...props} />
}
export function AlertDialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)} {...props} />
}
export const AlertDialogTitle = AlertDialogPrimitive.Title
export const AlertDialogDescription = AlertDialogPrimitive.Description
export const AlertDialogAction = AlertDialogPrimitive.Action
export const AlertDialogCancel = AlertDialogPrimitive.Cancel

export const alertDialogActionClassName = buttonVariants({ variant: 'destructive' })
export const alertDialogCancelClassName = buttonVariants({ variant: 'outline' })
