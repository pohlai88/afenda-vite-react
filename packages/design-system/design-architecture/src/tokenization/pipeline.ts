/**
 * TOKENIZATION PIPELINE
 *
 * Canonical compile graph for the design-system theme CSS artifact. Individual modules
 * remain the source of truth; this file documents order and re-exports the default spine
 * so consumers and tools have one integration surface.
 *
 * **Compile order (hot path → `generated-theme.css`):**
 * 1. `token-constants` + `token-types` — vocabulary and structural types
 * 2. `token-contract` — parse / validate `ThemeTokenSource`
 * 3. `token-source` — canonical token values
 * 4. `token-normalize` — deterministic `NormalizedThemeTokenSource`
 * 5. `token-bridge` — CSS declaration structures (`BridgedThemeTokens`)
 * 6. `token-serialize` — deterministic CSS text (`SerializedThemeCss`)
 * 7. `token-emit` — generator header + combined body + optional file IO
 *
 * **Theme-static vs `:root`:** `token-bridge` places color ramps, typography (`--text-*`),
 * and component spacing (`--spacing-*`) in `@theme static` so Tailwind v4 can emit matching
 * utilities; density and control sizes stay on `:root` as runtime parameters.
 *
 * **Post-core (artifact assembly in `generate-theme-css-artifact`):**
 * - `token-tailwind-adapter` — shadcn/runtime alias blocks appended after core CSS
 *
 * **Sidecar / governance (not in CSS hot path):**
 * - `token-manifest` — JSON artifact (hashes, section metrics)
 * - `shadcn-registry` — alias metadata for the adapter
 * - `token-color-collision-policy` — tests / policy for primitive collisions
 *
 * **Shared formatting:** `token-text` — newlines and section gaps (`token-serialize`, `token-emit`)
 */

export {
  TOKENIZATION_PIPELINE_ARTIFACT_FILES,
  TOKENIZATION_PIPELINE_SOURCE_FILES,
} from './token-pipeline-order'

export { themeTokenSource } from './token-source'
export { normalizedThemeTokenSource } from './token-normalize'
export { bridgedThemeTokens } from './token-bridge'
export { serializedThemeCss } from './token-serialize'
export {
  buildEmittedThemeCssContent,
  createGeneratedFileHeader,
  DEFAULT_EMITTED_THEME_FILENAME,
  DEFAULT_EMITTED_THEME_OUTPUT_PATH,
  emitThemeCss,
  writeEmittedThemeCssFile,
} from './token-emit'
