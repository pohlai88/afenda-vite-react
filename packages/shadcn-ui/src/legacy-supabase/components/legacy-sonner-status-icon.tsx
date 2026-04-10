import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ElementType,
  type SVGProps,
} from "react"

import { cn } from "@/lib/utils"

export interface LegacyStatusIconProps {
  hideBackground?: boolean
}

const StatusIconInner = forwardRef<
  HTMLOrSVGElement,
  ComponentPropsWithoutRef<"svg"> & {
    variant: "success" | "warning" | "destructive" | "default"
  } & LegacyStatusIconProps
>(({ variant = "default", ...props }, ref) => {
  let Icon: ElementType | undefined
  if (variant === "warning") {
    Icon = WarningIcon
  } else if (variant === "destructive") {
    Icon = CriticalIcon
  } else if (variant === "success") {
    Icon = CheckIcon
  } else {
    Icon = InfoIcon
  }

  return Icon ? <Icon ref={ref} {...props} /> : null
})
StatusIconInner.displayName = "LegacyStatusIcon"

/** Toast / inline status icons (legacy Supabase SVG set). */
export const LegacyStatusIcon = StatusIconInner

const InfoIcon = ({
  hideBackground = false,
  ...props
}: SVGProps<SVGSVGElement> & LegacyStatusIconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      {...props}
      className={cn(
        !hideBackground
          ? "size-4 rounded bg-foreground-lighter p-0.5 text-background-surface-200"
          : "size-3 text-foreground-lighter",
        props.className,
      )}
    >
      <path
        fillRule="evenodd"
        d="M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0ZM9 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM6.75 8a.75.75 0 0 0 0 1.5h.75v1.75a.75.75 0 0 0 1.5 0v-2.5A.75.75 0 0 0 8.25 8h-1.5Z"
        clipRule="evenodd"
      />
    </svg>
  )
}

const CriticalIcon = ({
  hideBackground = false,
  ...props
}: SVGProps<SVGSVGElement> & LegacyStatusIconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      {...props}
      className={cn(
        !hideBackground
          ? "size-4 rounded bg-destructive-600 p-0.5 text-destructive-200"
          : "size-3 text-destructive-600",
        props.className,
      )}
    >
      <path
        fillRule="evenodd"
        d="M6.701 2.25c.577-1 2.02-1 2.598 0l5.196 9a1.5 1.5 0 0 1-1.299 2.25H2.804a1.5 1.5 0 0 1-1.3-2.25l5.197-9ZM8 4a.75.75 0 0 1 .75.75v3a.75.75 0 1 1-1.5 0v-3A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
        clipRule="evenodd"
      />
    </svg>
  )
}

const WarningIcon = ({
  hideBackground = false,
  ...props
}: SVGProps<SVGSVGElement> & LegacyStatusIconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      {...props}
      className={cn(
        !hideBackground
          ? "size-4 rounded bg-warning-600 p-0.5 text-warning-200"
          : "size-3 text-warning",
        props.className,
      )}
    >
      <path
        fillRule="evenodd"
        d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14ZM8 4a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
        clipRule="evenodd"
      />
    </svg>
  )
}

const CheckIcon = ({
  hideBackground = false,
  ...props
}: SVGProps<SVGSVGElement> & LegacyStatusIconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      {...props}
      className={cn(
        !hideBackground
          ? "size-4 rounded bg-foreground p-0.5 text-background"
          : "size-3 text-success-600",
        props.className,
      )}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={3}
        d="m4.5 12.75 6 6 9-13.5"
      />
    </svg>
  )
}
