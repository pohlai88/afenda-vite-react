import * as React from 'react'
import { OTPInput, OTPInputContext } from 'input-otp'
import { Minus } from 'lucide-react'
import { cn } from '../../lib/utils/cn.js'

export const InputOTP = OTPInput

export function InputOTPGroup({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex items-center', className)} {...props} />
}

export function InputOTPSlot({ index, className, ...props }: { index: number } & React.HTMLAttributes<HTMLDivElement>) {
  const otpContext = React.useContext(OTPInputContext)
  const { char, hasFakeCaret, isActive } = otpContext.slots[index]

  return (
    <div
      className={cn(
        'relative flex h-10 w-10 items-center justify-center border-y border-r border-input text-sm first:rounded-l-md first:border-l last:rounded-r-md',
        isActive && 'z-10 ring-2 ring-ring',
        className,
      )}
      {...props}
    >
      {char}
      {hasFakeCaret ? <div className="pointer-events-none absolute inset-0 flex items-center justify-center"><div className="h-4 w-px animate-caret-blink bg-foreground" /></div> : null}
    </div>
  )
}

export function InputOTPSeparator(props: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div role="separator" {...props}>
      <Minus />
    </div>
  )
}
