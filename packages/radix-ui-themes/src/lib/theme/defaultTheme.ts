/**
 * Runtime class-map truth layer for component styling.
 * Components reference this object instead of scattering hardcoded classes.
 */
export const defaultTheme = {
  button: {
    base: 'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
    variants: {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90',
      destructive:
        'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      outline:
        'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      link: 'text-primary underline-offset-4 hover:underline',
    },
    sizes: {
      default: 'h-10 px-4 py-2',
      sm: 'h-9 rounded-md px-3',
      lg: 'h-11 rounded-md px-8',
      icon: 'h-10 w-10',
    },
  },
  badge: {
    base: 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    variants: {
      default: 'border-transparent bg-primary text-primary-foreground',
      secondary: 'border-transparent bg-secondary text-secondary-foreground',
      outline: 'border-border text-foreground',
      destructive:
        'border-transparent bg-destructive text-destructive-foreground',
    },
  },
  field: {
    input:
      'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
    textarea:
      'min-h-[96px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
    label: 'text-sm font-medium text-foreground',
    helper: 'text-xs text-muted-foreground',
    error: 'text-xs text-destructive',
  },
  overlay: {
    backdrop: 'fixed inset-0 z-50 bg-background/80 backdrop-blur-sm',
    content:
      'fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-background shadow-lg p-6',
    sheet:
      'fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out',
    popover:
      'z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none',
    tooltip:
      'z-50 overflow-hidden rounded-md bg-foreground px-3 py-1.5 text-xs text-background animate-in fade-in-0 zoom-in-95',
  },
  dialog: {
    overlayState:
      'data-[state=open]:animate-in data-[state=closed]:animate-out',
    close:
      'absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    header: 'flex flex-col space-y-1.5 text-center sm:text-left',
    footer: 'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
    title: 'text-lg font-semibold leading-none',
    description: 'text-sm text-muted-foreground',
  },
  nav: {
    breadcrumb: 'text-sm text-muted-foreground',
    menuItem:
      'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground',
  },
  dropdownMenu: {
    content:
      'z-50 min-w-[8rem] rounded-md border bg-popover p-1 text-popover-foreground shadow-md',
    item: 'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground',
    shortcut: 'ml-auto text-xs tracking-widest opacity-60',
  },
  tabs: {
    list: 'inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground',
    trigger:
      'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
    content:
      'mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
  },
  table: {
    wrapper: 'relative w-full overflow-auto',
    root: 'w-full caption-bottom text-sm',
    header: '[&_tr]:border-b',
    body: '[&_tr:last-child]:border-0',
    row: 'border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted',
    head: 'h-10 px-2 text-left align-middle font-medium text-muted-foreground',
    cell: 'p-2 align-middle',
    footer: 'border-t bg-muted/50 font-medium [&>tr]:last:border-b-0',
    caption: 'mt-4 text-sm text-muted-foreground',
  },
  card: {
    root: 'rounded-lg border bg-card text-card-foreground shadow-sm',
    header: 'flex flex-col space-y-1.5 p-6',
    title: 'font-semibold leading-none tracking-tight',
    description: 'text-sm text-muted-foreground',
    content: 'p-6 pt-0',
    footer: 'flex items-center p-6 pt-0',
  },
} as const

export type DefaultTheme = typeof defaultTheme
