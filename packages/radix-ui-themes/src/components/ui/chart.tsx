import { ResponsiveContainer } from 'recharts'
import { cn } from '../../lib/utils/cn.js'

export type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode
    color?: string
  }
>

export const ChartContainer = ({
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement> & {
  config: ChartConfig
}) => {
  return (
    <div className={cn('h-[320px] w-full', className)}>
      <ResponsiveContainer width="100%" height="100%">
        {children as React.ReactElement}
      </ResponsiveContainer>
    </div>
  )
}

export const ChartTooltip = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('rounded-md border bg-background px-2 py-1 text-xs shadow-sm', className)} {...props} />
)

export const ChartLegend = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-wrap items-center gap-2 text-xs text-muted-foreground', className)} {...props} />
)
