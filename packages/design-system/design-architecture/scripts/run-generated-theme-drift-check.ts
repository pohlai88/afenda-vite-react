/**
 * Single orchestrator for generated theme artifacts (CI + local):
 *
 * 1. Regenerate `design-architecture/src/generated/generated-theme.css` and
 *    `generated-theme.manifest.json` via the tokenization pipeline.
 * 2. `git diff --exit-code` on both files vs `HEAD` (manifest uses `emitRevision`, which only
 *    changes when emitted CSS bytes change — no timestamp noise).
 *
 * **Do not** type the npm script name alone in PowerShell (`test:generated-drift-check` is not an
 * executable). Use `pnpm run test:generated-drift-check` from `packages/design-system`, or
 * `pnpm run design-system:generated-drift-check` from the monorepo root, or run this file with
 * `pnpm exec tsx` as documented in `README.md` in this folder.
 */

import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const packageRoot = path.resolve(__dirname, '../..')
const cssRel = 'design-architecture/src/generated/generated-theme.css'
const manifestRel =
  'design-architecture/src/generated/generated-theme.manifest.json'

await import('./generate-design-system.ts')

try {
  execFileSync('git', ['diff', '--exit-code', '--', cssRel, manifestRel], {
    cwd: packageRoot,
    stdio: 'inherit',
  })
} catch {
  console.error(
    'Generated theme drift: commit or discard changes under design-architecture/src/generated/ (generated-theme.css and/or generated-theme.manifest.json).',
  )
  process.exit(1)
}
