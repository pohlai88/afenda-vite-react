/// <reference types="node" />

import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { execFile as execFileCallback } from 'node:child_process'
import { promisify } from 'node:util'
import {
  assert,
  isRecord,
  readJsonFile,
  toPosixPath,
  workspaceRoot,
} from '../afenda-config.js'

const execFile = promisify(execFileCallback)

export const uiRoot = path.join(workspaceRoot, 'packages/ui')
export const uiComponentsRoot = path.join(uiRoot, 'src/components/ui')
export const packageJsonPath = path.join(uiRoot, 'package.json')
export const componentsJsonPath = path.join(uiRoot, 'components.json')
export const sealDirectory = path.join(workspaceRoot, 'scripts/seal')
export const lockManifestPath = path.join(
  sealDirectory,
  'ui-primitives.lock.json',
)

export const ALLOWED_PRIMITIVE_FILES = [
  'accordion.tsx',
  'accessible-icon.tsx',
  'alert-dialog.tsx',
  'alert.tsx',
  'aspect-ratio.tsx',
  'avatar.tsx',
  'badge.tsx',
  'breadcrumb.tsx',
  'button-group.tsx',
  'button.tsx',
  'calendar.tsx',
  'card.tsx',
  'carousel.tsx',
  'chart.tsx',
  'checkbox.tsx',
  'collapsible.tsx',
  'combobox.tsx',
  'command.tsx',
  'context-menu.tsx',
  'dialog.tsx',
  'direction.tsx',
  'drawer.tsx',
  'dropdown-menu.tsx',
  'empty.tsx',
  'field.tsx',
  'form.tsx',
  'hover-card.tsx',
  'input-group.tsx',
  'input-otp.tsx',
  'input.tsx',
  'item.tsx',
  'kbd.tsx',
  'label.tsx',
  'menubar.tsx',
  'native-select.tsx',
  'navigation-menu.tsx',
  'pagination.tsx',
  'popover.tsx',
  'progress.tsx',
  'radio-group.tsx',
  'resizable.tsx',
  'scroll-area.tsx',
  'select.tsx',
  'separator.tsx',
  'sheet.tsx',
  'sidebar.tsx',
  'skeleton.tsx',
  'slider.tsx',
  'sonner.tsx',
  'spinner.tsx',
  'switch.tsx',
  'table.tsx',
  'tabs.tsx',
  'textarea.tsx',
  'toggle-group.tsx',
  'toggle.tsx',
  'tooltip.tsx',
  'visually-hidden.tsx',
] as const

const allowedPrimitiveFileSet: ReadonlySet<string> = new Set(
  ALLOWED_PRIMITIVE_FILES,
)

export type ComponentsJson = {
  style?: unknown
  aliases?: unknown
}

export type UiPackageJson = {
  dependencies?: Record<string, string>
}

export type UiPrimitiveLockManifest = {
  schemaVersion: 1
  lockVersion: 1
  createdAt: string
  fileCount: number
  keyHash: string
  paths: string[]
}

export async function collectUiPrimitiveFiles() {
  const entries = await fs.readdir(uiComponentsRoot, { withFileTypes: true })
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.tsx'))
    .map((entry) => path.join(uiComponentsRoot, entry.name))
    .sort((left, right) => left.localeCompare(right))
}

export async function collectUiSealTargetFiles() {
  const primitiveFiles = await collectUiPrimitiveFiles()
  return [componentsJsonPath, packageJsonPath, ...primitiveFiles].sort(
    (left, right) => left.localeCompare(right),
  )
}

export function hashUnlockKey(key: string) {
  return crypto.createHash('sha256').update(key, 'utf8').digest('hex')
}

export function getUnlockKeyFromEnv() {
  const key = process.env.UI_PRIMITIVES_UNLOCK_KEY?.trim()
  assert(
    typeof key === 'string' && key.length > 0,
    'UI_PRIMITIVES_UNLOCK_KEY is required. Example (PowerShell): $env:UI_PRIMITIVES_UNLOCK_KEY="your-key"',
  )
  return key
}

export async function readLockManifest() {
  const value = await readJsonFile(lockManifestPath)
  assert(
    isRecord(value),
    'scripts/seal/ui-primitives.lock.json must be a JSON object.',
  )

  assert(value.schemaVersion === 1, 'Lock manifest schemaVersion must be 1.')
  assert(value.lockVersion === 1, 'Lock manifest lockVersion must be 1.')
  assert(
    typeof value.createdAt === 'string',
    'Lock manifest createdAt must be a string.',
  )
  assert(
    typeof value.fileCount === 'number',
    'Lock manifest fileCount must be a number.',
  )
  assert(
    typeof value.keyHash === 'string',
    'Lock manifest keyHash must be a string.',
  )
  assert(Array.isArray(value.paths), 'Lock manifest paths must be an array.')
  value.paths.forEach((entry, index) => {
    assert(
      typeof entry === 'string',
      `Lock manifest paths[${index}] must be a string.`,
    )
  })

  return value as UiPrimitiveLockManifest
}

export async function writeLockManifest(manifest: UiPrimitiveLockManifest) {
  await fs.mkdir(sealDirectory, { recursive: true })
  await fs.writeFile(
    lockManifestPath,
    `${JSON.stringify(manifest, null, 2)}${os.EOL}`,
    'utf8',
  )
}

export async function removeLockManifest() {
  await fs.rm(lockManifestPath, { force: true })
}

export async function setFilesLocked(filePaths: string[]) {
  if (process.platform === 'win32') {
    for (const filePath of filePaths) {
      await execFile('attrib', ['+R', filePath])
    }
    return
  }

  for (const filePath of filePaths) {
    await fs.chmod(filePath, 0o444)
  }
}

export async function setFilesUnlocked(filePaths: string[]) {
  if (process.platform === 'win32') {
    for (const filePath of filePaths) {
      await execFile('attrib', ['-R', filePath])
    }
    return
  }

  for (const filePath of filePaths) {
    await fs.chmod(filePath, 0o644)
  }
}

export function toWorkspaceRelativePaths(filePaths: string[]) {
  return filePaths.map((filePath) =>
    toPosixPath(path.relative(workspaceRoot, filePath)),
  )
}

export function assertApprovedPrimitiveFileInventory(actualFiles: string[]) {
  const expectedFiles = [...ALLOWED_PRIMITIVE_FILES].sort((left, right) =>
    left.localeCompare(right),
  )

  const unexpectedFiles = actualFiles.filter(
    (fileName) => !allowedPrimitiveFileSet.has(fileName),
  )
  const missingFiles = expectedFiles.filter(
    (fileName) => !actualFiles.includes(fileName),
  )

  assert(
    unexpectedFiles.length === 0,
    `Unexpected primitive files found under packages/ui/src/components/ui: ${unexpectedFiles.join(', ')}.`,
  )
  assert(
    missingFiles.length === 0,
    `Expected primitive files are missing under packages/ui/src/components/ui: ${missingFiles.join(', ')}.`,
  )
}

export async function runCheck<T>(
  label: string,
  run: () => Promise<T> | T,
  successDetail?: (value: T) => string,
): Promise<T> {
  try {
    const value = await run()
    const detail = successDetail ? successDetail(value) : undefined
    console.log(detail ? `[ok] ${label}: ${detail}` : `[ok] ${label}`)
    return value
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`[${label}] ${message}`)
  }
}
