/**
 * Top navigation layout for the ERP shell. **Sizing and spacing tokens** live in
 * `apps/web/src/index.css` (`--top-nav-search-omni-max-width`, `--top-nav-cmdk-omni-max-width`,
 * `top-nav-omni-bar` utility).
 */

/** Must stay aligned with `:root --top-nav-max-scope-icon-switchers` in index.css */
export const TOP_NAV_MAX_SCOPE_ICON_SWITCHERS = 2

/** Primary row: explicit shell grid keeps nav, search, and utilities in fixed lanes. */
export const topNavRowClassName =
  'grid h-(--header-height) w-full min-w-0 shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-[var(--top-nav-inner-gap)] px-(--top-nav-padding-x) md:grid-cols-[minmax(0,1fr)_minmax(0,var(--top-nav-center-column-width))_auto] lg:gap-x-3 lg:px-(--top-nav-padding-x-lg)'

/** Left: scope strip + primary nav. Nav itself owns overflow, not the whole lane. */
export const topNavLeftClusterClassName =
  'flex min-w-0 items-center gap-[var(--top-nav-inner-gap)] overflow-hidden md:gap-2'

/** Center: paired omni controls (md+). */
export const topNavSearchColumnClassName =
  'hidden min-w-0 w-full items-center justify-center gap-2 md:flex'

/** Right edge: icon rail + account. */
export const topNavRightEdgeClassName =
  'flex shrink-0 items-center justify-end gap-1 md:justify-self-end'

export const topNavShellIconTriggerClassName =
  'relative size-8 shrink-0 rounded-md border border-transparent bg-transparent p-0 text-muted-foreground/85 hover:border-border/60 hover:bg-muted/40 hover:text-foreground [&_svg]:size-4 [&_svg]:shrink-0'

export const topNavShellTextTriggerClassName =
  'h-8 shrink-0 rounded-md border border-transparent bg-transparent px-2.5 text-[length:var(--top-nav-font-size)] font-medium leading-tight text-muted-foreground/90 hover:border-border/60 hover:bg-muted/35 hover:text-foreground'

/** @deprecated Top bar no longer hosts the sidebar trigger; rail footer only. */
export const topNavSidebarTriggerClassName =
  'h-8 w-8 shrink-0 rounded-md text-muted-foreground hover:bg-muted/70 hover:text-foreground [&_svg]:size-[18px]'

/** Breadcrumb strip (left cluster). */
export const topNavBreadcrumbNavClassName =
  'flex min-w-0 shrink-0 items-center gap-[var(--top-nav-inner-gap)] md:gap-2'

/** Semantic search `InputGroup` — uses global `top-nav-omni-bar` utility; width from parent wrapper. */
export const topNavSearchInputGroupClassName =
  'top-nav-omni-bar w-full !max-w-none border-border/50 bg-muted/20 [&_[data-slot=input-group-addon]]:px-2.5 [&_[data-slot=input-group-addon]]:text-muted-foreground/75 [&_[data-slot=input-group-addon]_svg]:size-4 [&_[data-slot=input-group-control]]:h-7 [&_[data-slot=input-group-control]]:border-0 [&_[data-slot=input-group-control]]:bg-transparent [&_[data-slot=input-group-control]]:px-0 [&_[data-slot=input-group-control]]:py-0 [&_[data-slot=input-group-control]]:text-[length:var(--top-nav-font-size)] [&_[data-slot=input-group-control]]:shadow-none [&_[data-slot=input-group-control]]:placeholder:text-muted-foreground/65 [&_[data-slot=button]]:size-6 [&_[data-slot=button]]:rounded-md [&_[data-slot=button]]:text-muted-foreground/75'

/** Module crumb (text) — short label only. */
export const topNavModuleCrumbClassName =
  'max-w-[7.5rem] truncate text-[length:var(--top-nav-font-size)] font-medium leading-tight text-foreground md:max-w-[10rem]'
