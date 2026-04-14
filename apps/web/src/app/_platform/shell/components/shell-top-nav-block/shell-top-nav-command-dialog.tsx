"use client"

import type { ShellBreadcrumbResolvedItem } from "../../contract/shell-breadcrumb-contract"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@afenda/design-system/ui-primitives"

export type ShellTopNavCommandDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  inputPlaceholder: string
  emptyLabel: string
  groupNavLabel: string
  navItems: readonly ShellBreadcrumbResolvedItem[]
  onSelectNavItem: (to: string) => void
}

export function ShellTopNavCommandDialog({
  open,
  onOpenChange,
  title,
  description,
  inputPlaceholder,
  emptyLabel,
  groupNavLabel,
  navItems,
  onSelectNavItem,
}: ShellTopNavCommandDialogProps) {
  const commandNavItems = navItems.filter(
    (b): b is typeof b & { to: string } =>
      typeof b.to === "string" && b.to.length > 0
  )

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
    >
      <CommandInput
        placeholder={inputPlaceholder}
        aria-describedby={undefined}
      />
      <CommandList>
        <CommandEmpty>{emptyLabel}</CommandEmpty>
        <CommandGroup heading={groupNavLabel}>
          {commandNavItems.map((item) => (
            <CommandItem
              key={`cmd-nav-${item.id}`}
              value={item.label}
              onSelect={() => onSelectNavItem(item.to)}
            >
              <span className="truncate">{item.label}</span>
              <CommandShortcut>↵</CommandShortcut>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
