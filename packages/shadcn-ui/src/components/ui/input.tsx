import type * as React from "react"
import { cva } from "class-variance-authority"

import {
  inputDefaults,
  type InputSize,
} from "../../lib/constant/component/input"
import { cn } from "../../lib/utils"

const inputVariants = cva(
  "w-full min-w-0 rounded-3xl border border-transparent bg-input/50 transition-[color,box-shadow,background-color] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
  {
    variants: {
      inputSize: {
        sm: "h-8 px-3 py-1 text-sm",
        default: "h-9 px-3 py-1 text-base md:text-sm",
        lg: "h-10 px-4 py-2 text-base",
      },
    },
    defaultVariants: {
      inputSize: inputDefaults.size,
    },
  }
)

function Input({
  className,
  type,
  inputSize = inputDefaults.size,
  ...props
}: React.ComponentProps<"input"> & { inputSize?: InputSize }) {
  return (
    <input
      type={type}
      data-slot="input"
      data-size={inputSize}
      className={cn(
        inputVariants({ inputSize }),
        className
      )}
      {...props}
    />
  )
}

export { Input }
