'use client'

import * as React from 'react'

import { cn } from '../../../lib/utils/cn'

import { Button, type ButtonProps } from './button'

interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

interface ButtonGroupItemProps extends Omit<ButtonProps, 'variant'> {
  children: React.ReactNode
  icon?: React.ReactNode
  asChild?: boolean
}

const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-stretch overflow-hidden rounded-md border border-control',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
ButtonGroup.displayName = 'ButtonGroup'

const ButtonGroupItem = React.forwardRef<HTMLButtonElement, ButtonGroupItemProps>(
  ({ className, children, icon, asChild, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        type="button"
        variant="ghost"
        asChild={asChild}
        className={cn(
          'h-auto justify-start rounded-none border-0 border-b border-border py-2 last:border-b-0',
          className
        )}
        {...props}
      >
        {asChild ? (
          children
        ) : (
          <>
            {icon ? <span className="mr-2 inline-flex shrink-0">{icon}</span> : null}
            {children}
          </>
        )}
      </Button>
    )
  }
)
ButtonGroupItem.displayName = 'ButtonGroupItem'

export { ButtonGroup, ButtonGroupItem, type ButtonGroupProps, type ButtonGroupItemProps }
