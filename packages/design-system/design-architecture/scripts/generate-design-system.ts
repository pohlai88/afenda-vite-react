/**
 * Emits the design-system theme CSS artifact from the tokenization pipeline
 * and a JSON manifest (`generated-theme.manifest.json`) for versioning / drift tracking.
 * Run: `pnpm --filter @afenda/design-system run generate-design-system` (repo root).
 * Full drift validation (regenerate + `git diff` on CSS + manifest vs `HEAD`):
 * `run-generated-theme-drift-check.ts` (`pnpm run test:generated-drift-check` from `packages/design-system`).
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { generateThemeCssArtifact } from './generate-theme-css-artifact'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

await generateThemeCssArtifact({
  outputFilePath: path.resolve(
    __dirname,
    '../src/generated/generated-theme.css',
  ),
})
