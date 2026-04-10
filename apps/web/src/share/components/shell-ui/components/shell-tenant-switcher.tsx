import {
  ScopeSwitcher,
  type ScopeSwitcherProps,
} from '@/share/components/block-ui'

export type ShellTenantSwitcherProps = ScopeSwitcherProps

/** Governed tenant scope control — delegates to {@link ScopeSwitcher}. */
export function ShellTenantSwitcher(props: ShellTenantSwitcherProps) {
  return (
    <span data-shell-key="shell-tenant-switcher" className="contents">
      <ScopeSwitcher {...props} />
    </span>
  )
}
