import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '../../lib/utils/cn.js'
import { Button } from './button.js'

export type CarouselProps = React.HTMLAttributes<HTMLDivElement>

export function Carousel({ className, ...props }: CarouselProps) {
  return <div className={cn('relative w-full', className)} {...props} />
}

export function CarouselContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex overflow-x-auto snap-x snap-mandatory gap-4', className)} {...props} />
}

export function CarouselItem({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('min-w-0 shrink-0 grow-0 basis-full snap-start', className)} {...props} />
}

export function CarouselPrevious({ className, ...props }: React.ComponentProps<typeof Button>) {
  return (
    <Button
      variant="outline"
      size="icon"
      className={cn('absolute left-2 top-1/2 -translate-y-1/2', className)}
      {...props}
    >
      <ChevronLeft className="h-4 w-4" />
      <span className="sr-only">Previous slide</span>
    </Button>
  )
}

export function CarouselNext({ className, ...props }: React.ComponentProps<typeof Button>) {
  return (
    <Button
      variant="outline"
      size="icon"
      className={cn('absolute right-2 top-1/2 -translate-y-1/2', className)}
      {...props}
    >
      <ChevronRight className="h-4 w-4" />
      <span className="sr-only">Next slide</span>
    </Button>
  )
}
