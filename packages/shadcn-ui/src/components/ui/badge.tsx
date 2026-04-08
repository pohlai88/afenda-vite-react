import * as React from "react"
import { cva } from "class-variance-authority"
import { Slot } from "radix-ui"

import {
  badgeDefaults,
  type BadgeEmphasis,
  type BadgeVariant,
} from "../../lib/constant/component/badge"
import { cn } from "../../lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-3xl border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "",
        secondary: "",
        outline: "border-border text-foreground [a]:hover:bg-muted",
        success: "",
        warning: "",
        destructive: "",
        info: "",
      },
      emphasis: {
        subtle: "",
        solid: "",
      },
    },
    compoundVariants: [
      {
        variant: "default",
        emphasis: "subtle",
        className:
          "bg-primary/10 text-primary [a]:hover:bg-primary/20",
      },
      {
        variant: "default",
        emphasis: "solid",
        className:
          "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
      },
      {
        variant: "secondary",
        emphasis: "subtle",
        className:
          "bg-secondary/70 text-secondary-foreground [a]:hover:bg-secondary",
      },
      {
        variant: "secondary",
        emphasis: "solid",
        className:
          "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
      },
      {
        variant: "success",
        emphasis: "subtle",
        className:
          "bg-success/10 text-success [a]:hover:bg-success/20",
      },
      {
        variant: "success",
        emphasis: "solid",
        className:
          "bg-success text-success-foreground [a]:hover:bg-success/80",
      },
      {
        variant: "warning",
        emphasis: "subtle",
        className:
          "bg-warning/15 text-warning [a]:hover:bg-warning/25",
      },
      {
        variant: "warning",
        emphasis: "solid",
        className:
          "bg-warning text-warning-foreground [a]:hover:bg-warning/80",
      },
      {
        variant: "destructive",
        emphasis: "subtle",
        className:
          "bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20",
      },
      {
        variant: "destructive",
        emphasis: "solid",
        className:
          "bg-destructive text-destructive-foreground focus-visible:ring-destructive/30 [a]:hover:bg-destructive/90",
      },
      {
        variant: "info",
        emphasis: "subtle",
        className:
          "bg-info/10 text-info [a]:hover:bg-info/20",
      },
      {
        variant: "info",
        emphasis: "solid",
        className:
          "bg-info text-info-foreground [a]:hover:bg-info/80",
      },
    ],
    defaultVariants: {
      variant: badgeDefaults.variant,
      emphasis: badgeDefaults.emphasis,
    },
  }
)

type BadgeProps = React.ComponentProps<"span"> & {
  variant?: BadgeVariant
  emphasis?: BadgeEmphasis
  asChild?: boolean
}

function Badge({
  className,
  variant = badgeDefaults.variant,
  emphasis = badgeDefaults.emphasis,
  asChild = false,
  ...props
}: BadgeProps) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      data-emphasis={emphasis}
      className={cn(badgeVariants({ variant, emphasis }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
