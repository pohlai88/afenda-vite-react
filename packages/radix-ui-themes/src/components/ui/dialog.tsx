/* eslint-disable react-refresh/only-export-components */
import type { Ref } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils/cn.js'
import { defaultTheme } from '../../lib/theme/defaultTheme.js'

export const Dialog = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger
export const DialogPortal = DialogPrimitive.Portal
export const DialogClose = DialogPrimitive.Close

export function DialogOverlay({
  className,
  ref,
  ...props
}: DialogPrimitive.DialogOverlayProps & { ref?: Ref<HTMLDivElement> }) {
  return (
    <DialogPrimitive.Overlay
      ref={ref}
      className={cn(
        defaultTheme.overlay.backdrop,
        defaultTheme.dialog.overlayState,
        className,
      )}
      {...props}
    />
  )
}

export function DialogContent({
  className,
  children,
  ref,
  ...props
}: DialogPrimitive.DialogContentProps & { ref?: Ref<HTMLDivElement> }) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(defaultTheme.overlay.content, className)}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className={defaultTheme.dialog.close}>
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

export function DialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn(defaultTheme.dialog.header, className)} {...props} />
  )
}

export function DialogFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn(defaultTheme.dialog.footer, className)} {...props} />
  )
}

export function DialogTitle({
  className,
  ref,
  ...props
}: DialogPrimitive.DialogTitleProps & { ref?: Ref<HTMLHeadingElement> }) {
  return (
    <DialogPrimitive.Title
      ref={ref}
      className={cn(defaultTheme.dialog.title, className)}
      {...props}
    />
  )
}

export function DialogDescription({
  className,
  ref,
  ...props
}: DialogPrimitive.DialogDescriptionProps & {
  ref?: Ref<HTMLParagraphElement>
}) {
  return (
    <DialogPrimitive.Description
      ref={ref}
      className={cn(defaultTheme.dialog.description, className)}
      {...props}
    />
  )
}
