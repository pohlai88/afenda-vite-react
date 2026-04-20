import type { ComponentPropsWithoutRef, ReactNode } from "react"

import { cn } from "@afenda/design-system/utils"

export interface MarketingPageSectionProps extends ComponentPropsWithoutRef<"section"> {
  readonly children: ReactNode
  readonly containerClassName?: string
}

export function MarketingPageSection({
  children,
  className,
  containerClassName,
  ...props
}: MarketingPageSectionProps) {
  return (
    <section className={className} {...props}>
      <div
        className={cn(
          "marketing-container marketing-section-standard",
          containerClassName
        )}
      >
        {children}
      </div>
    </section>
  )
}

export interface MarketingSectionKickerProps extends ComponentPropsWithoutRef<"div"> {
  readonly children: ReactNode
}

export function MarketingSectionKicker({
  children,
  className,
  ...props
}: MarketingSectionKickerProps) {
  return (
    <div className={cn("marketing-kicker", className)} {...props}>
      {children}
    </div>
  )
}

export interface MarketingSectionHeadingProps {
  readonly kicker: string
  readonly title: ReactNode
  readonly description?: ReactNode
  readonly as?: "h1" | "h2" | "h3"
  readonly id?: string
  readonly className?: string
  readonly titleClassName?: string
  readonly descriptionClassName?: string
}

export function MarketingSectionHeading({
  kicker,
  title,
  description,
  as: TitleTag = "h2",
  id,
  className,
  titleClassName,
  descriptionClassName,
}: MarketingSectionHeadingProps) {
  return (
    <div className={className}>
      <MarketingSectionKicker>{kicker}</MarketingSectionKicker>
      <TitleTag
        id={id}
        className={cn(
          "marketing-anchor-offset marketing-heading-section mt-5 max-w-4xl",
          titleClassName
        )}
      >
        {title}
      </TitleTag>
      {description ? (
        <div
          className={cn(
            "marketing-copy-body mt-6 max-w-3xl",
            descriptionClassName
          )}
        >
          {description}
        </div>
      ) : null}
    </div>
  )
}
