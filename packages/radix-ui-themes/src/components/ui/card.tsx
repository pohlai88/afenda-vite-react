import type { Ref } from 'react'
import { cn } from '../../lib/utils/cn.js'
import { defaultTheme } from '../../lib/theme/defaultTheme.js'

export function Card({ className, ref, ...props }: React.HTMLAttributes<HTMLDivElement> & { ref?: Ref<HTMLDivElement> }) {
  return <div ref={ref} className={cn(defaultTheme.card.root, className)} {...props} />
}
export function CardHeader({ className, ref, ...props }: React.HTMLAttributes<HTMLDivElement> & { ref?: Ref<HTMLDivElement> }) {
  return <div ref={ref} className={cn(defaultTheme.card.header, className)} {...props} />
}
export function CardTitle({ className, ref, ...props }: React.HTMLAttributes<HTMLHeadingElement> & { ref?: Ref<HTMLHeadingElement> }) {
  const { children, ...rest } = props
  return (
    <h3 ref={ref} className={cn(defaultTheme.card.title, className)} {...rest}>
      {children}
    </h3>
  )
}
export function CardDescription({ className, ref, ...props }: React.HTMLAttributes<HTMLParagraphElement> & { ref?: Ref<HTMLParagraphElement> }) {
  return <p ref={ref} className={cn(defaultTheme.card.description, className)} {...props} />
}
export function CardContent({ className, ref, ...props }: React.HTMLAttributes<HTMLDivElement> & { ref?: Ref<HTMLDivElement> }) {
  return <div ref={ref} className={cn(defaultTheme.card.content, className)} {...props} />
}
export function CardFooter({ className, ref, ...props }: React.HTMLAttributes<HTMLDivElement> & { ref?: Ref<HTMLDivElement> }) {
  return <div ref={ref} className={cn(defaultTheme.card.footer, className)} {...props} />
}
