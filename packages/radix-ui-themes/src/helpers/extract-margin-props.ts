/**
 * Re-exports the margin-prop extraction utility from Radix Themes.
 *
 * Radix Themes components accept margin shorthand props (`m`, `mx`, `my`,
 * `mt`, `mr`, `mb`, `ml`). This helper separates margin props from the
 * remaining props so they can be applied to a wrapper element.
 *
 * This is a thin re-export — the implementation lives in @radix-ui/themes.
 * If the upstream helper is not publicly accessible in v3, consumers should
 * use the Radix `<Box>` layout primitive for margin control instead.
 */

export type MarginProps = {
  m?: string
  mx?: string
  my?: string
  mt?: string
  mr?: string
  mb?: string
  ml?: string
}

export function extractMarginProps<T extends MarginProps>(
  props: T,
): { marginProps: MarginProps; rest: Omit<T, keyof MarginProps> } {
  const { m, mx, my, mt, mr, mb, ml, ...rest } = props
  return {
    marginProps: { m, mx, my, mt, mr, mb, ml },
    rest: rest as Omit<T, keyof MarginProps>,
  }
}
