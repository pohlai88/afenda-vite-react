import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Canonical `cn` for `@afenda/design-system` (clsx + tailwind-merge). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
