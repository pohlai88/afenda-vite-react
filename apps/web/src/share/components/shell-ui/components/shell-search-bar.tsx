import {
  GlobalSearchBar,
  type GlobalSearchBarProps,
} from '@/share/components/search/global-search-bar'

export type ShellSearchBarProps = GlobalSearchBarProps

/** Primary inline global search entry (`command` zone) — delegates to {@link GlobalSearchBar}. */
export function ShellSearchBar(props: ShellSearchBarProps) {
  return <GlobalSearchBar {...props} />
}
