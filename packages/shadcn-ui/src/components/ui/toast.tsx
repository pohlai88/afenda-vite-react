/**
 * COPIED PRIMITIVE — ui-toast
 * Copied low-level primitive surface retained for reusable UI work inside the package.
 * Origin: this file follows copied primitive patterns rather than the semantic contract layer.
 * Consumption: feature code should prefer governed semantic wrappers when a semantic surface exists.
 * Boundaries: changes here affect low-level primitive behavior and should remain deliberate.
 * Changes: preserve accessibility and compatibility expectations when updating the copied primitive.
 * Purpose: provide a reusable primitive while keeping semantic governance above this layer.
 */
import type * as React from "react"
import { Toast as ToastPrimitive } from "radix-ui"
import { XIcon } from "lucide-react"

import { cn } from "../../lib/utils.js"

function ToastProvider({
  ...props
}: React.ComponentProps<typeof ToastPrimitive.Provider>) {
  return <ToastPrimitive.Provider data-slot="toast-provider" {...props} />
}

function ToastViewport({
  className,
  ...props
}: React.ComponentProps<typeof ToastPrimitive.Viewport>) {
  return (
    <ToastPrimitive.Viewport
      data-slot="toast-viewport"
      className={cn(
        "fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
        className
      )}
      {...props}
    />
  )
}

function Toast({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof ToastPrimitive.Root> & {
  variant?: "default" | "destructive"
}) {
  return (
    <ToastPrimitive.Root
      data-slot="toast"
      data-variant={variant}
      className={cn(
        "group pointer-events-auto relative flex w-full items-center justify-between gap-4 overflow-hidden rounded-3xl border p-4 pr-8 shadow-lg ring-1 ring-foreground/5 transition-all data-open:animate-in data-open:slide-in-from-bottom-full data-open:fade-in-80 data-closed:animate-out data-closed:slide-out-to-right-full data-closed:fade-out-80 dark:ring-foreground/10",
        "data-[variant=default]:bg-background data-[variant=default]:text-foreground",
        "data-[variant=destructive]:border-destructive/30 data-[variant=destructive]:bg-destructive/10 data-[variant=destructive]:text-destructive",
        className
      )}
      {...props}
    />
  )
}

function ToastAction({
  className,
  ...props
}: React.ComponentProps<typeof ToastPrimitive.Action>) {
  return (
    <ToastPrimitive.Action
      data-slot="toast-action"
      className={cn(
        "inline-flex h-8 shrink-0 items-center justify-center rounded-xl border border-transparent bg-secondary px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-data-[variant=destructive]:border-destructive/30 group-data-[variant=destructive]:bg-destructive/10 group-data-[variant=destructive]:text-destructive group-data-[variant=destructive]:hover:bg-destructive/20",
        className
      )}
      {...props}
    />
  )
}

function ToastClose({
  className,
  ...props
}: React.ComponentProps<typeof ToastPrimitive.Close>) {
  return (
    <ToastPrimitive.Close
      data-slot="toast-close"
      className={cn(
        "absolute right-2 top-2 rounded-xl p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring group-hover:opacity-100 group-data-[variant=destructive]:text-destructive/70 group-data-[variant=destructive]:hover:text-destructive",
        className
      )}
      toast-close=""
      {...props}
    >
      <XIcon className="size-4" />
    </ToastPrimitive.Close>
  )
}

function ToastTitle({
  className,
  ...props
}: React.ComponentProps<typeof ToastPrimitive.Title>) {
  return (
    <ToastPrimitive.Title
      data-slot="toast-title"
      className={cn("text-sm font-semibold", className)}
      {...props}
    />
  )
}

function ToastDescription({
  className,
  ...props
}: React.ComponentProps<typeof ToastPrimitive.Description>) {
  return (
    <ToastPrimitive.Description
      data-slot="toast-description"
      className={cn("text-sm opacity-90", className)}
      {...props}
    />
  )
}

export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
}
