import type { Ref } from 'react'
import { cn } from '../../lib/utils/cn.js'
import { defaultTheme } from '../../lib/theme/defaultTheme.js'

export function Table({
  className,
  ref,
  ...props
}: React.TableHTMLAttributes<HTMLTableElement> & {
  ref?: Ref<HTMLTableElement>
}) {
  return (
    <div className={defaultTheme.table.wrapper}>
      <table
        ref={ref}
        className={cn(defaultTheme.table.root, className)}
        {...props}
      />
    </div>
  )
}
export const TableHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <thead className={cn(defaultTheme.table.header, className)} {...props} />
)
export const TableBody = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <tbody className={cn(defaultTheme.table.body, className)} {...props} />
)
export const TableFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <tfoot className={cn(defaultTheme.table.footer, className)} {...props} />
)
export const TableRow = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement>) => (
  <tr className={cn(defaultTheme.table.row, className)} {...props} />
)
export const TableHead = ({
  className,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement>) => (
  <th className={cn(defaultTheme.table.head, className)} {...props} />
)
export const TableCell = ({
  className,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) => (
  <td className={cn(defaultTheme.table.cell, className)} {...props} />
)
export const TableCaption = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableCaptionElement>) => (
  <caption className={cn(defaultTheme.table.caption, className)} {...props} />
)
