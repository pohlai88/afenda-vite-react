/**
 * Layout constants for the **static icon rail** (excluding the brand tile).
 *
 * ## Capacity (advisory)
 * The rail uses `--sidebar-width-icon` (**3rem ≈ 48px** wide) from the design-system sidebar.
 * Each widget row is effectively **~32px** tall (`h-8` menu button) plus **~4px** vertical gap (`gap-1`),
 * so each slot ≈ **36px** of scrollable stack height.
 *
 * **Recommended:** **5–7** widget icons between brand and footer (Miller’s “7±2” for scannable chrome).
 * **Hard ceiling:** **12** — beyond this, rely on scroll and consider moving extras to the panel or overflow.
 *
 * Footer (user menu) and header (brand) are **not** counted as widgets.
 */
export const SHELL_RAIL_WIDTH_REM = 3

/** Target max visible widget icons without feeling crowded (product guidance). */
export const SHELL_RAIL_WIDGET_MAX_RECOMMENDED = 7

/** Safety cap before UX strongly suggests overflow / settings UI. */
export const SHELL_RAIL_WIDGET_MAX_HARD = 12
