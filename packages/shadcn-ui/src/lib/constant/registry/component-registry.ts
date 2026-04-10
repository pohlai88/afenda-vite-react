/**
 * COMPONENT REGISTRY — component-registry
 * Canonical aggregate registry for exported component vocabularies.
 * Tier: Tier 1: simple registry aggregate.
 * Source of truth: this file aggregates canonical component sources; it does not replace them.
 * Runtime: exported schemas support aggregate validation and tooling boundaries.
 * Consumption: use this registry and schema for inspection, validation, or tooling, not as a duplicate authoring home.
 * Defaults: defaults belong in source files, not in this aggregate registry.
 * Constraints: registry entries must point only to canonical component exports.
 * Changes: update canonical source files first, then keep this aggregate synchronized.
 * Purpose: expose one reviewable component index for tooling and validation.
 */
import { type z } from "zod/v4"

import { accordionVariantValues } from "../component/accordion"
import { alertVariantValues } from "../component/alert"
import { alertDialogContentSizeValues } from "../component/alert-dialog"
import { aspectRatioVariantValues } from "../component/aspect-ratio"
import { avatarVariantValues } from "../component/avatar"
import { badgeVariantValues } from "../component/badge"
import { breadcrumbVariantValues } from "../component/breadcrumb"
import { buttonSizeValues, buttonVariantValues } from "../component/button"
import { buttonGroupOrientationValues } from "../component/button-group"
import { calendarVariantValues } from "../component/calendar"
import { cardPaddingValues, cardSurfaceValues } from "../component/card"
import { carouselOrientationValues } from "../component/carousel"
import { chartThemeKeyValues } from "../component/chart"
import { checkboxVariantValues } from "../component/checkbox"
import { collapsibleVariantValues } from "../component/collapsible"
import { comboboxVariantValues } from "../component/combobox"
import {
  commandGroupRoleValues,
  commandItemIntentValues,
} from "../component/command"
import { contextMenuVariantValues } from "../component/context-menu"
import { dialogSizeValues } from "../component/dialog"
import { directionDirValues } from "../component/direction"
import { drawerDirectionValues } from "../component/drawer"
import { dropdownMenuVariantValues } from "../component/dropdown-menu"
import { emptyMediaVariantValues } from "../component/empty"
import { fieldOrientationValues } from "../component/field"
import { fieldStateValues } from "../component/form"
import { hoverCardVariantValues } from "../component/hover-card"
import { inputSizeValues } from "../component/input"
import {
  inputGroupAddonAlignValues,
  inputGroupButtonSizeValues,
} from "../component/input-group"
import { inputOtpVariantValues } from "../component/input-otp"
import {
  itemMediaVariantValues,
  itemSizeValues,
  itemVariantValues,
} from "../component/item"
import { kbdVariantValues } from "../component/kbd"
import { labelVariantValues } from "../component/label"
import { menubarVariantValues } from "../component/menubar"
import { nativeSelectVariantValues } from "../component/native-select"
import { navigationMenuVariantValues } from "../component/navigation-menu"
import { paginationVariantValues } from "../component/pagination"
import { popoverVariantValues } from "../component/popover"
import { progressVariantValues } from "../component/progress"
import { radioGroupVariantValues } from "../component/radio-group"
import { resizableVariantValues } from "../component/resizable"
import { scrollAreaVariantValues } from "../component/scroll-area"
import { selectVariantValues } from "../component/select"
import { separatorOrientationValues } from "../component/separator"
import { sheetSideValues } from "../component/sheet"
import {
  sidebarMenuButtonSizeValues,
  sidebarMenuButtonVariantValues,
} from "../component/sidebar"
import { skeletonVariantValues } from "../component/skeleton"
import { sliderVariantValues } from "../component/slider"
import { sonnerThemeValues } from "../component/sonner"
import { spinnerVariantValues } from "../component/spinner"
import { switchVariantValues } from "../component/switch"
import { tableDensityValues } from "../component/table"
import { tabsListVariantValues } from "../component/tabs"
import { textareaVariantValues } from "../component/textarea"
import { themeProviderThemeValues } from "../component/theme-provider"
import { toastVariantValues } from "../component/toast"
import { toggleGroupOrientationValues } from "../component/toggle-group"
import { toggleSizeValues, toggleVariantValues } from "../component/toggle"
import { tooltipVariantValues } from "../component/tooltip"
import {
  defineConstMap,
  nestedRegistrySchemaFromDefinition,
  type NestedRegistryTupleMapDefinition,
} from "../schema/shared"

type ComponentRegistryDefinition = NestedRegistryTupleMapDefinition<{
  accordion: { variants: typeof accordionVariantValues }
  alert: { variants: typeof alertVariantValues }
  alertDialog: { contentSizes: typeof alertDialogContentSizeValues }
  aspectRatio: { variants: typeof aspectRatioVariantValues }
  avatar: { variants: typeof avatarVariantValues }
  badge: { variants: typeof badgeVariantValues }
  breadcrumb: { variants: typeof breadcrumbVariantValues }
  button: {
    variants: typeof buttonVariantValues
    sizes: typeof buttonSizeValues
  }
  buttonGroup: { orientations: typeof buttonGroupOrientationValues }
  calendar: { variants: typeof calendarVariantValues }
  card: {
    surfaces: typeof cardSurfaceValues
    paddings: typeof cardPaddingValues
  }
  carousel: { orientations: typeof carouselOrientationValues }
  chart: { themeKeys: typeof chartThemeKeyValues }
  checkbox: { variants: typeof checkboxVariantValues }
  collapsible: { variants: typeof collapsibleVariantValues }
  combobox: { variants: typeof comboboxVariantValues }
  command: {
    roles: typeof commandGroupRoleValues
    intents: typeof commandItemIntentValues
  }
  contextMenu: { variants: typeof contextMenuVariantValues }
  dialog: { sizes: typeof dialogSizeValues }
  direction: { dirs: typeof directionDirValues }
  drawer: { directions: typeof drawerDirectionValues }
  dropdownMenu: { variants: typeof dropdownMenuVariantValues }
  empty: { mediaVariants: typeof emptyMediaVariantValues }
  field: {
    orientations: typeof fieldOrientationValues
    states: typeof fieldStateValues
  }
  form: { fieldStates: typeof fieldStateValues }
  hoverCard: { variants: typeof hoverCardVariantValues }
  input: { sizes: typeof inputSizeValues }
  inputGroup: {
    addonAligns: typeof inputGroupAddonAlignValues
    buttonSizes: typeof inputGroupButtonSizeValues
  }
  inputOtp: { variants: typeof inputOtpVariantValues }
  item: {
    variants: typeof itemVariantValues
    sizes: typeof itemSizeValues
    mediaVariants: typeof itemMediaVariantValues
  }
  kbd: { variants: typeof kbdVariantValues }
  label: { variants: typeof labelVariantValues }
  menubar: { variants: typeof menubarVariantValues }
  nativeSelect: { variants: typeof nativeSelectVariantValues }
  navigationMenu: { variants: typeof navigationMenuVariantValues }
  pagination: { variants: typeof paginationVariantValues }
  popover: { variants: typeof popoverVariantValues }
  progress: { variants: typeof progressVariantValues }
  radioGroup: { variants: typeof radioGroupVariantValues }
  resizable: { variants: typeof resizableVariantValues }
  scrollArea: { variants: typeof scrollAreaVariantValues }
  select: { variants: typeof selectVariantValues }
  separator: { orientations: typeof separatorOrientationValues }
  sheet: { sides: typeof sheetSideValues }
  sidebar: {
    menuButtonVariants: typeof sidebarMenuButtonVariantValues
    menuButtonSizes: typeof sidebarMenuButtonSizeValues
  }
  skeleton: { variants: typeof skeletonVariantValues }
  slider: { variants: typeof sliderVariantValues }
  sonner: { themes: typeof sonnerThemeValues }
  spinner: { variants: typeof spinnerVariantValues }
  switch: { variants: typeof switchVariantValues }
  table: { densities: typeof tableDensityValues }
  tabs: { listVariants: typeof tabsListVariantValues }
  textarea: { variants: typeof textareaVariantValues }
  themeProvider: { themes: typeof themeProviderThemeValues }
  toast: { variants: typeof toastVariantValues }
  toggle: {
    variants: typeof toggleVariantValues
    sizes: typeof toggleSizeValues
  }
  toggleGroup: {
    variants: typeof toggleVariantValues
    sizes: typeof toggleSizeValues
    orientations: typeof toggleGroupOrientationValues
  }
  tooltip: { variants: typeof tooltipVariantValues }
}>

const componentRegistryDefinition = {
  accordion: { variants: accordionVariantValues },
  alert: { variants: alertVariantValues },
  alertDialog: { contentSizes: alertDialogContentSizeValues },
  aspectRatio: { variants: aspectRatioVariantValues },
  avatar: { variants: avatarVariantValues },
  badge: { variants: badgeVariantValues },
  breadcrumb: { variants: breadcrumbVariantValues },
  button: { variants: buttonVariantValues, sizes: buttonSizeValues },
  buttonGroup: { orientations: buttonGroupOrientationValues },
  calendar: { variants: calendarVariantValues },
  card: { surfaces: cardSurfaceValues, paddings: cardPaddingValues },
  carousel: { orientations: carouselOrientationValues },
  chart: { themeKeys: chartThemeKeyValues },
  checkbox: { variants: checkboxVariantValues },
  collapsible: { variants: collapsibleVariantValues },
  combobox: { variants: comboboxVariantValues },
  command: { roles: commandGroupRoleValues, intents: commandItemIntentValues },
  contextMenu: { variants: contextMenuVariantValues },
  dialog: { sizes: dialogSizeValues },
  direction: { dirs: directionDirValues },
  drawer: { directions: drawerDirectionValues },
  dropdownMenu: { variants: dropdownMenuVariantValues },
  empty: { mediaVariants: emptyMediaVariantValues },
  field: {
    orientations: fieldOrientationValues,
    states: fieldStateValues,
  },
  form: { fieldStates: fieldStateValues },
  hoverCard: { variants: hoverCardVariantValues },
  input: { sizes: inputSizeValues },
  inputGroup: {
    addonAligns: inputGroupAddonAlignValues,
    buttonSizes: inputGroupButtonSizeValues,
  },
  inputOtp: { variants: inputOtpVariantValues },
  item: {
    variants: itemVariantValues,
    sizes: itemSizeValues,
    mediaVariants: itemMediaVariantValues,
  },
  kbd: { variants: kbdVariantValues },
  label: { variants: labelVariantValues },
  menubar: { variants: menubarVariantValues },
  nativeSelect: { variants: nativeSelectVariantValues },
  navigationMenu: { variants: navigationMenuVariantValues },
  pagination: { variants: paginationVariantValues },
  popover: { variants: popoverVariantValues },
  progress: { variants: progressVariantValues },
  radioGroup: { variants: radioGroupVariantValues },
  resizable: { variants: resizableVariantValues },
  scrollArea: { variants: scrollAreaVariantValues },
  select: { variants: selectVariantValues },
  separator: { orientations: separatorOrientationValues },
  sheet: { sides: sheetSideValues },
  sidebar: {
    menuButtonVariants: sidebarMenuButtonVariantValues,
    menuButtonSizes: sidebarMenuButtonSizeValues,
  },
  skeleton: { variants: skeletonVariantValues },
  slider: { variants: sliderVariantValues },
  sonner: { themes: sonnerThemeValues },
  spinner: { variants: spinnerVariantValues },
  switch: { variants: switchVariantValues },
  table: { densities: tableDensityValues },
  tabs: { listVariants: tabsListVariantValues },
  textarea: { variants: textareaVariantValues },
  themeProvider: { themes: themeProviderThemeValues },
  toast: { variants: toastVariantValues },
  toggle: { variants: toggleVariantValues, sizes: toggleSizeValues },
  toggleGroup: {
    variants: toggleVariantValues,
    sizes: toggleSizeValues,
    orientations: toggleGroupOrientationValues,
  },
  tooltip: { variants: tooltipVariantValues },
} as const satisfies ComponentRegistryDefinition

export const componentRegistrySchema = nestedRegistrySchemaFromDefinition(
  componentRegistryDefinition,
)
export type ComponentRegistrySnapshot = z.infer<typeof componentRegistrySchema>

export const componentRegistry = defineConstMap(
  componentRegistrySchema.parse(componentRegistryDefinition),
)
