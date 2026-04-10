import {
  ScopeSwitcher,
  type ScopeSwitcherProps,
} from '@/share/components/block-ui'

export type ShellWorkspaceSwitcherProps = ScopeSwitcherProps

/** Governed workspace / subsidiary scope control — delegates to {@link ScopeSwitcher}. */
export function ShellWorkspaceSwitcher(props: ShellWorkspaceSwitcherProps) {
  return (
    <span data-shell-key="shell-workspace-switcher" className="contents">
      <ScopeSwitcher {...props} />
    </span>
  )
}
