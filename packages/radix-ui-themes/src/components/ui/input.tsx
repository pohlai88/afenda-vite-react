import type { InputHTMLAttributes, Ref } from 'react'
import { cn } from '../../lib/utils/cn.js'
import { defaultTheme } from '../../lib/theme/defaultTheme.js'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  ref?: Ref<HTMLInputElement>
}

export function Input({ className, type = 'text', ref, ...props }: InputProps) {
  return <input ref={ref} type={type} className={cn(defaultTheme.field.input, className)} {...props} />
}
