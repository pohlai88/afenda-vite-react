/// <reference types="node" />

/**
 * Locks `packages/ui` primitive files as read-only and stores a local unlock-key hash.
 * Run from repo root with:
 * `pnpm run script:lock-ui-primitives`
 */

import {
  collectUiSealTargetFiles,
  getUnlockKeyFromEnv,
  hashUnlockKey,
  runCheck,
  setFilesLocked,
  toWorkspaceRelativePaths,
  writeLockManifest,
} from './ui-primitives.js'

async function main() {
  const unlockKey = getUnlockKeyFromEnv()
  const files = await collectUiSealTargetFiles()
  const relativePaths = toWorkspaceRelativePaths(files)

  await runCheck(
    'Write lock manifest',
    async () => {
      await writeLockManifest({
        schemaVersion: 1,
        lockVersion: 1,
        createdAt: new Date().toISOString(),
        fileCount: relativePaths.length,
        keyHash: hashUnlockKey(unlockKey),
        paths: relativePaths,
      })
    },
    () =>
      `${relativePaths.length} sealed UI files registered in scripts/seal/ui-primitives.lock.json.`,
  )

  await runCheck(
    'Lock primitive files',
    async () => {
      await setFilesLocked(files)
    },
    () => `${relativePaths.length} sealed UI files marked read-only.`,
  )

  console.log('UI primitives locked')
}

await main()
