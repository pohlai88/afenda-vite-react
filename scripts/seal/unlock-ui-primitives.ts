/// <reference types="node" />

/**
 * Unlocks `packages/ui` primitive files for intentional editing.
 * Run from repo root with:
 * `pnpm run script:unlock-ui-primitives`
 */

import path from 'node:path'
import { assert, toPosixPath, workspaceRoot } from '../afenda-config.js'
import {
  collectUiSealTargetFiles,
  getUnlockKeyFromEnv,
  hashUnlockKey,
  readLockManifest,
  runCheck,
  setFilesUnlocked,
} from './ui-primitives.js'

async function main() {
  const unlockKey = getUnlockKeyFromEnv()
  const manifest = await runCheck(
    'Read lock manifest',
    async () => readLockManifest(),
    () => 'scripts/seal/ui-primitives.lock.json loaded.',
  )

  await runCheck(
    'Validate unlock key',
    async () => {
      assert(
        hashUnlockKey(unlockKey) === manifest.keyHash,
        'Unlock key does not match the stored UI primitives lock manifest.',
      )
    },
    () => 'Unlock key accepted.',
  )

  const files = await collectUiSealTargetFiles()

  await runCheck(
    'Validate locked file inventory',
    async () => {
      const actualPaths = files.map((filePath) =>
        toPosixPath(path.relative(workspaceRoot, filePath)),
      )
      assert(
        actualPaths.length === manifest.paths.length &&
          actualPaths.every(
            (filePath, index) => filePath === manifest.paths[index],
          ),
        `Locked primitive file inventory no longer matches the manifest.\nExpected: ${manifest.paths.join(', ')}\nActual: ${actualPaths.join(', ')}`,
      )
    },
    () => `${manifest.paths.length} sealed UI files match the lock manifest.`,
  )

  await runCheck(
    'Unlock primitive files',
    async () => {
      await setFilesUnlocked(files)
    },
    () => `${files.length} sealed UI files marked writable.`,
  )

  console.log('UI primitives unlocked')
}

await main()
