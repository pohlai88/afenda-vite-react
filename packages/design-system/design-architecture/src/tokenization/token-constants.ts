/**
 * TOKEN CONSTANTS
 *
 * Canonical token vocabulary for the design pipeline (`design-architecture` / tokenization).
 *
 * Rules:
 * - vocabulary, types derived from literals, CSS variable name helpers, type guards
 * - does not contain concrete theme values, validation, CSS serialization, or domain semantics
 *
 * Design stance:
 * - Tailwind v4 consumes runtime variables through `@theme`
 * - shadcn semantic naming remains first-class
 * - Figma variable collections should map into these token families
 * - ERP-grade UI uses foundation plus enterprise-ui groups
 */

// =============================================================================
// Modes
// =============================================================================

export const themeModeValues = ['light', 'dark'] as const
export type ThemeMode = (typeof themeModeValues)[number]

// =============================================================================
// Foundation - color families
// =============================================================================

export const semanticCoreColorTokenValues = [
  'background',
  'foreground',
  'card',
  'card-foreground',
  'popover',
  'popover-foreground',
  'primary',
  'primary-foreground',
  'secondary',
  'secondary-foreground',
  'muted',
  'muted-foreground',
  'accent',
  'accent-foreground',
  'destructive',
  'destructive-foreground',
  'border',
  'input',
  'ring',
  'ring-offset',
] as const

export const primaryScaleColorTokenValues = [
  'primary-50',
  'primary-100',
  'primary-200',
  'primary-300',
  'primary-400',
  'primary-500',
  'primary-600',
  'primary-700',
  'primary-800',
  'primary-900',
  'primary-950',
] as const

export const chartColorTokenValues = [
  'chart-1',
  'chart-2',
  'chart-3',
  'chart-4',
  'chart-5',
] as const

export const sidebarColorTokenValues = [
  'sidebar',
  'sidebar-foreground',
  'sidebar-primary',
  'sidebar-primary-foreground',
  'sidebar-accent',
  'sidebar-accent-foreground',
  'sidebar-border',
  'sidebar-ring',
] as const

// =============================================================================
// Enterprise UI - color families
// =============================================================================

export const surfaceStateColorTokenValues = [
  'surface-hover',
  'surface-active',
  'surface-selected',
  'surface-disabled',
  'surface-readonly',
  'surface-focus',
] as const

export const borderHierarchyColorTokenValues = [
  'border-muted',
  'border-strong',
  'border-grid',
  'border-focus',
] as const

export const feedbackColorTokenValues = [
  'success',
  'success-foreground',
  'warning',
  'warning-foreground',
  'info',
  'info-foreground',
] as const

export const dataDisplayColorTokenValues = [
  'table-header',
  'table-row-hover',
  'table-row-selected',
  'table-row-stripe',
  'table-cell-focus',
  'table-pinned',
] as const

/** Content / layout surfaces: prose blocks, code blocks, text selection (not `surface-*` state tokens). */
export const contentColorTokenValues = [
  'surface',
  'surface-foreground',
  'code',
  'code-foreground',
  'code-highlight',
  'code-number',
  'selection',
  'selection-foreground',
] as const

// =============================================================================
// Composed - color families
// =============================================================================

export const semanticColorTokenValues = [
  ...semanticCoreColorTokenValues,
  ...primaryScaleColorTokenValues,
] as const

export const enterpriseUiColorTokenValues = [
  ...surfaceStateColorTokenValues,
  ...borderHierarchyColorTokenValues,
  ...feedbackColorTokenValues,
  ...dataDisplayColorTokenValues,
] as const

export const colorTokenValues = [
  ...semanticColorTokenValues,
  ...chartColorTokenValues,
  ...sidebarColorTokenValues,
  ...contentColorTokenValues,
  ...enterpriseUiColorTokenValues,
] as const

// =============================================================================
// Size, layout, density
// =============================================================================

export const radiusTokenValues = [
  'sm',
  'md',
  'lg',
  'xl',
  '2xl',
  '3xl',
  '4xl',
] as const

export const containerTokenValues = [
  'xs',
  'sm',
  'md',
  'lg',
  'xl',
  '2xl',
] as const

/** Tailwind v4 `@theme` breakpoint overrides (`--breakpoint-*`). */
export const breakpointTokenValues = ['3xl', '4xl'] as const

export const densityTokenValues = [
  'compact',
  'comfortable',
  'spacious',
] as const

export const controlSizeTokenValues = [
  'control-xs',
  'control-sm',
  'control-md',
  'control-lg',
  'toolbar-height',
  'table-row-height',
  'table-header-height',
] as const

export const componentSpacingTokenValues = [
  'panel-padding',
  'form-gap',
] as const

// =============================================================================
// Typography
// =============================================================================

export const fontTokenValues = ['sans', 'mono', 'heading', 'serif'] as const

export const textSizeTokenValues = [
  'ui-xs',
  'ui-sm',
  'ui-md',
  'ui-lg',
  'label',
  'helper',
  'table',
  'section-title',
  'metric',
] as const

// =============================================================================
// Motion
// =============================================================================

export const animationTokenValues = [
  'fade-in',
  'fade-out',
  'slide-in',
  'slide-out',
  'dialog-in',
  'dialog-out',
] as const

// Keyframe names intentionally mirror animation tokens so `--animate-*`
// variables can reference matching Tailwind v4 `@keyframes` identifiers.
export const keyframeTokenValues = animationTokenValues

// =============================================================================
// Family registry
// =============================================================================

export const tokenFamilyValues = [
  'semantic-colors',
  'chart-colors',
  'sidebar-colors',
  'content-colors',
  'enterprise-ui-colors',
  'radius',
  'containers',
  'breakpoints',
  'density',
  'control-sizes',
  'component-spacing',
  'fonts',
  'text-sizes',
  'animations',
  'keyframes',
] as const

export type TokenFamily = (typeof tokenFamilyValues)[number]

export const tokenFamilyMembers = {
  'semantic-colors': semanticColorTokenValues,
  'chart-colors': chartColorTokenValues,
  'sidebar-colors': sidebarColorTokenValues,
  'content-colors': contentColorTokenValues,
  'enterprise-ui-colors': enterpriseUiColorTokenValues,
  radius: radiusTokenValues,
  containers: containerTokenValues,
  breakpoints: breakpointTokenValues,
  density: densityTokenValues,
  'control-sizes': controlSizeTokenValues,
  'component-spacing': componentSpacingTokenValues,
  fonts: fontTokenValues,
  'text-sizes': textSizeTokenValues,
  animations: animationTokenValues,
  keyframes: keyframeTokenValues,
} as const satisfies Record<TokenFamily, readonly string[]>

export type TokenFamilyMember<K extends TokenFamily> =
  (typeof tokenFamilyMembers)[K][number]

// =============================================================================
// Derived types - by value group
// =============================================================================

export type SemanticCoreColorToken =
  (typeof semanticCoreColorTokenValues)[number]

export type PrimaryScaleColorToken =
  (typeof primaryScaleColorTokenValues)[number]

export type SemanticColorToken = (typeof semanticColorTokenValues)[number]

export type ChartColorToken = (typeof chartColorTokenValues)[number]

export type SidebarColorToken = (typeof sidebarColorTokenValues)[number]

export type SurfaceStateColorToken =
  (typeof surfaceStateColorTokenValues)[number]

export type BorderHierarchyColorToken =
  (typeof borderHierarchyColorTokenValues)[number]

export type FeedbackColorToken = (typeof feedbackColorTokenValues)[number]

export type DataDisplayColorToken = (typeof dataDisplayColorTokenValues)[number]

export type EnterpriseUiColorToken =
  (typeof enterpriseUiColorTokenValues)[number]

export type ContentColorToken = (typeof contentColorTokenValues)[number]

export type ColorToken = (typeof colorTokenValues)[number]

export type RadiusToken = (typeof radiusTokenValues)[number]

export type ContainerToken = (typeof containerTokenValues)[number]

export type BreakpointToken = (typeof breakpointTokenValues)[number]

export type DensityToken = (typeof densityTokenValues)[number]

export type ControlSizeToken = (typeof controlSizeTokenValues)[number]

export type ComponentSpacingToken = (typeof componentSpacingTokenValues)[number]

export type FontToken = (typeof fontTokenValues)[number]

export type TextSizeToken = (typeof textSizeTokenValues)[number]

export type AnimationToken = (typeof animationTokenValues)[number]

export type KeyframeToken = (typeof keyframeTokenValues)[number]

export type DesignToken = {
  [K in TokenFamily]: TokenFamilyMember<K>
}[TokenFamily]

// =============================================================================
// CSS variable name types
// =============================================================================

export type ColorCssVarName<T extends ColorToken = ColorToken> = `--color-${T}`

export type RadiusCssVarName<T extends RadiusToken = RadiusToken> =
  `--radius-${T}`

export type ContainerCssVarName<T extends ContainerToken = ContainerToken> =
  `--container-${T}`

export type DensityCssVarName<T extends DensityToken = DensityToken> =
  `--density-${T}`

export type ControlSizeCssVarName<
  T extends ControlSizeToken = ControlSizeToken,
> = `--size-${T}`

export type ComponentSpacingCssVarName<
  T extends ComponentSpacingToken = ComponentSpacingToken,
> = `--spacing-${T}`

export type FontCssVarName<T extends FontToken = FontToken> = `--font-${T}`

export type BreakpointCssVarName<T extends BreakpointToken = BreakpointToken> =
  `--breakpoint-${T}`

export type TextSizeCssVarName<T extends TextSizeToken = TextSizeToken> =
  `--text-${T}`

export type AnimationCssVarName<T extends AnimationToken = AnimationToken> =
  `--animate-${T}`

// =============================================================================
// CSS variable name helpers
// =============================================================================

export function colorCssVarName<T extends ColorToken>(
  token: T,
): ColorCssVarName<T> {
  return `--color-${token}`
}

export function radiusCssVarName<T extends RadiusToken>(
  token: T,
): RadiusCssVarName<T> {
  return `--radius-${token}`
}

export function containerCssVarName<T extends ContainerToken>(
  token: T,
): ContainerCssVarName<T> {
  return `--container-${token}`
}

export function densityCssVarName<T extends DensityToken>(
  token: T,
): DensityCssVarName<T> {
  return `--density-${token}`
}

export function controlSizeCssVarName<T extends ControlSizeToken>(
  token: T,
): ControlSizeCssVarName<T> {
  return `--size-${token}`
}

export function componentSpacingCssVarName<T extends ComponentSpacingToken>(
  token: T,
): ComponentSpacingCssVarName<T> {
  return `--spacing-${token}`
}

export function fontCssVarName<T extends FontToken>(
  token: T,
): FontCssVarName<T> {
  return `--font-${token}`
}

export function breakpointCssVarName<T extends BreakpointToken>(
  token: T,
): BreakpointCssVarName<T> {
  return `--breakpoint-${token}`
}

export function textSizeCssVarName<T extends TextSizeToken>(
  token: T,
): TextSizeCssVarName<T> {
  return `--text-${token}`
}

export function animationCssVarName<T extends AnimationToken>(
  token: T,
): AnimationCssVarName<T> {
  return `--animate-${token}`
}

// =============================================================================
// Type guards
// =============================================================================

const themeModeSet = new Set<string>(themeModeValues)
const tokenFamilySet = new Set<string>(tokenFamilyValues)
const semanticCoreColorTokenSet = new Set<string>(semanticCoreColorTokenValues)
const primaryScaleColorTokenSet = new Set<string>(primaryScaleColorTokenValues)
const semanticColorTokenSet = new Set<string>(semanticColorTokenValues)
const chartColorTokenSet = new Set<string>(chartColorTokenValues)
const sidebarColorTokenSet = new Set<string>(sidebarColorTokenValues)
const surfaceStateColorTokenSet = new Set<string>(surfaceStateColorTokenValues)
const borderHierarchyColorTokenSet = new Set<string>(
  borderHierarchyColorTokenValues,
)
const feedbackColorTokenSet = new Set<string>(feedbackColorTokenValues)
const dataDisplayColorTokenSet = new Set<string>(dataDisplayColorTokenValues)
const enterpriseUiColorTokenSet = new Set<string>(enterpriseUiColorTokenValues)
const colorTokenSet = new Set<string>(colorTokenValues)
const radiusTokenSet = new Set<string>(radiusTokenValues)
const containerTokenSet = new Set<string>(containerTokenValues)
const densityTokenSet = new Set<string>(densityTokenValues)
const controlSizeTokenSet = new Set<string>(controlSizeTokenValues)
const componentSpacingTokenSet = new Set<string>(componentSpacingTokenValues)
const fontTokenSet = new Set<string>(fontTokenValues)
const breakpointTokenSet = new Set<string>(breakpointTokenValues)
const textSizeTokenSet = new Set<string>(textSizeTokenValues)
const animationTokenSet = new Set<string>(animationTokenValues)
const keyframeTokenSet = new Set<string>(keyframeTokenValues)

export function isThemeMode(value: string): value is ThemeMode {
  return themeModeSet.has(value)
}

export function isTokenFamily(value: string): value is TokenFamily {
  return tokenFamilySet.has(value)
}

export function isTokenFamilyMember<K extends TokenFamily>(
  family: K,
  value: string,
): value is TokenFamilyMember<K> {
  return (tokenFamilyMembers[family] as readonly string[]).includes(value)
}

export function isSemanticCoreColorToken(
  value: string,
): value is SemanticCoreColorToken {
  return semanticCoreColorTokenSet.has(value)
}

export function isPrimaryScaleColorToken(
  value: string,
): value is PrimaryScaleColorToken {
  return primaryScaleColorTokenSet.has(value)
}

export function isSemanticColorToken(
  value: string,
): value is SemanticColorToken {
  return semanticColorTokenSet.has(value)
}

export function isChartColorToken(value: string): value is ChartColorToken {
  return chartColorTokenSet.has(value)
}

export function isSidebarColorToken(value: string): value is SidebarColorToken {
  return sidebarColorTokenSet.has(value)
}

export function isSurfaceStateColorToken(
  value: string,
): value is SurfaceStateColorToken {
  return surfaceStateColorTokenSet.has(value)
}

export function isBorderHierarchyColorToken(
  value: string,
): value is BorderHierarchyColorToken {
  return borderHierarchyColorTokenSet.has(value)
}

export function isFeedbackColorToken(
  value: string,
): value is FeedbackColorToken {
  return feedbackColorTokenSet.has(value)
}

export function isDataDisplayColorToken(
  value: string,
): value is DataDisplayColorToken {
  return dataDisplayColorTokenSet.has(value)
}

export function isEnterpriseUiColorToken(
  value: string,
): value is EnterpriseUiColorToken {
  return enterpriseUiColorTokenSet.has(value)
}

export function isColorToken(value: string): value is ColorToken {
  return colorTokenSet.has(value)
}

export function isRadiusToken(value: string): value is RadiusToken {
  return radiusTokenSet.has(value)
}

export function isContainerToken(value: string): value is ContainerToken {
  return containerTokenSet.has(value)
}

export function isDensityToken(value: string): value is DensityToken {
  return densityTokenSet.has(value)
}

export function isControlSizeToken(value: string): value is ControlSizeToken {
  return controlSizeTokenSet.has(value)
}

export function isComponentSpacingToken(
  value: string,
): value is ComponentSpacingToken {
  return componentSpacingTokenSet.has(value)
}

export function isFontToken(value: string): value is FontToken {
  return fontTokenSet.has(value)
}

export function isBreakpointToken(value: string): value is BreakpointToken {
  return breakpointTokenSet.has(value)
}

export function isTextSizeToken(value: string): value is TextSizeToken {
  return textSizeTokenSet.has(value)
}

export function isAnimationToken(value: string): value is AnimationToken {
  return animationTokenSet.has(value)
}

export function isKeyframeToken(value: string): value is KeyframeToken {
  return keyframeTokenSet.has(value)
}
