/// <reference types="node" />

/**
 * Validates the sealed `packages/ui` primitive boundary:
 * - approved primitive file inventory
 * - Radix-first shadcn config baseline
 * - Base UI allowed only for `combobox.tsx`
 * - raw `sr-only` JSX blocked in favor of `VisuallyHidden`
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import {
  assert,
  isRecord,
  readJsonFile,
  toPosixPath,
  workspaceRoot,
} from '../afenda-config.js'
import {
  ALLOWED_PRIMITIVE_FILES,
  assertApprovedPrimitiveFileInventory,
  collectUiPrimitiveFiles,
  componentsJsonPath,
  packageJsonPath,
  runCheck,
  uiComponentsRoot,
} from './ui-primitives.js'
import type { ComponentsJson, UiPackageJson } from './ui-primitives.js'

async function main() {
  await runCheck(
    'Validate primitive file inventory',
    async () => {
      const entries = await fs.readdir(uiComponentsRoot, {
        withFileTypes: true,
      })
      const actualFiles = entries
        .filter((entry) => entry.isFile() && entry.name.endsWith('.tsx'))
        .map((entry) => entry.name)
        .sort((left, right) => left.localeCompare(right))

      assertApprovedPrimitiveFileInventory(actualFiles)
    },
    () => `${ALLOWED_PRIMITIVE_FILES.length} approved primitive files present.`,
  )

  await runCheck(
    'Validate shadcn baseline config',
    async () => {
      const value = await readJsonFile(componentsJsonPath)
      assert(
        isRecord(value),
        'packages/ui/components.json must be a JSON object.',
      )

      const config = value as ComponentsJson
      assert(
        config.style === 'radix-luma',
        `packages/ui/components.json must keep style "radix-luma", received ${JSON.stringify(config.style)}.`,
      )
      assert(
        isRecord(config.aliases),
        'packages/ui/components.json aliases must be an object.',
      )
      assert(
        config.aliases.ui === '@afenda/ui/components/ui',
        `packages/ui/components.json aliases.ui must be "@afenda/ui/components/ui", received ${JSON.stringify(config.aliases.ui)}.`,
      )
    },
    () => 'radix-luma baseline and aliases are intact.',
  )

  await runCheck(
    'Validate package dependency boundary',
    async () => {
      const value = await readJsonFile(packageJsonPath)
      assert(isRecord(value), 'packages/ui/package.json must be a JSON object.')

      const packageJson = value as UiPackageJson
      const dependencies = packageJson.dependencies ?? {}

      assert(
        typeof dependencies['radix-ui'] === 'string',
        'packages/ui/package.json must declare radix-ui.',
      )
      assert(
        typeof dependencies['@base-ui/react'] === 'string',
        'packages/ui/package.json must declare @base-ui/react for the approved combobox exception.',
      )
    },
    () => 'radix-ui and the combobox Base UI exception are declared.',
  )

  const files = await collectUiPrimitiveFiles()

  await runCheck(
    'Validate Base UI import exception',
    async () => {
      const offenders: string[] = []
      let comboboxUsesBaseUi = false

      for (const filePath of files) {
        const relativePath = toPosixPath(path.relative(workspaceRoot, filePath))
        const content = await fs.readFile(filePath, 'utf8')
        const usesBaseUi = content.includes(`from '@base-ui/react'`)

        if (!usesBaseUi) {
          continue
        }

        if (relativePath === 'packages/ui/src/components/ui/combobox.tsx') {
          comboboxUsesBaseUi = true
          continue
        }

        offenders.push(relativePath)
      }

      assert(
        comboboxUsesBaseUi,
        'packages/ui/src/components/ui/combobox.tsx must remain the explicit @base-ui/react exception.',
      )
      assert(
        offenders.length === 0,
        `@base-ui/react is only allowed in packages/ui/src/components/ui/combobox.tsx. Offenders: ${offenders.join(', ')}.`,
      )
    },
    () => 'Base UI is isolated to combobox.tsx.',
  )

  await runCheck(
    'Validate hidden text convention',
    async () => {
      const offenders: string[] = []

      for (const filePath of files) {
        const relativePath = toPosixPath(path.relative(workspaceRoot, filePath))
        const content = await fs.readFile(filePath, 'utf8')

        const hasRawSrOnlyJsx =
          /className\s*=\s*"[^"]*\bsr-only\b[^"]*"/.test(content) ||
          /className\s*=\s*'[^']*\bsr-only\b[^']*'/.test(content)

        if (hasRawSrOnlyJsx) {
          offenders.push(relativePath)
        }
      }

      assert(
        offenders.length === 0,
        `Use VisuallyHidden instead of raw sr-only JSX in packages/ui. Offenders: ${offenders.join(', ')}.`,
      )
    },
    () => 'No raw sr-only JSX found in primitive files.',
  )

  await runCheck(
    'Validate baseline accessibility utility primitives',
    async () => {
      const accessibleIconPath = path.join(
        uiComponentsRoot,
        'accessible-icon.tsx',
      )
      const visuallyHiddenPath = path.join(
        uiComponentsRoot,
        'visually-hidden.tsx',
      )

      const [accessibleIconContent, visuallyHiddenContent] = await Promise.all([
        fs.readFile(accessibleIconPath, 'utf8'),
        fs.readFile(visuallyHiddenPath, 'utf8'),
      ])

      assert(
        accessibleIconContent.includes(`data-slot="accessible-icon"`),
        'accessible-icon.tsx must expose data-slot="accessible-icon".',
      )
      assert(
        visuallyHiddenContent.includes(`data-slot="visually-hidden"`),
        'visually-hidden.tsx must expose data-slot="visually-hidden".',
      )
    },
    () =>
      'AccessibleIcon and VisuallyHidden primitives exist and expose stable slots.',
  )

  console.log('UI primitive boundary check passed')
}

await main()
