import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

import {
  DESIGN_SYSTEM_ROOT,
  GENERATED_RELATIVE_PATHS,
  GENERATED_DIR,
  detectArtifactDrift,
  generateGovernanceArtifacts,
} from './core'

const SCHEMA_FILES = [
  'generated/schemas/component-manifests.schema.json',
  'generated/schemas/component-variants.schema.json',
  'generated/schemas/component-coverage.schema.json',
] as const

function validateSchemaFilesExistAndParse(): void {
  for (const relativePath of SCHEMA_FILES) {
    const absolutePath = path.join(DESIGN_SYSTEM_ROOT, relativePath)
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`Missing schema file: ${relativePath}`)
    }
    const parsed = JSON.parse(fs.readFileSync(absolutePath, 'utf8')) as {
      title?: unknown
      type?: unknown
      properties?: unknown
    }
    if (typeof parsed.title !== 'string' || parsed.title.length === 0) {
      throw new Error(`Invalid schema title in ${relativePath}`)
    }
    if (parsed.type !== 'object') {
      throw new Error(`Schema ${relativePath} must declare type "object".`)
    }
    if (
      typeof parsed.properties !== 'object' ||
      parsed.properties === null ||
      Array.isArray(parsed.properties)
    ) {
      throw new Error(`Schema ${relativePath} must include root properties.`)
    }
  }
}

const generationResult = await generateGovernanceArtifacts({ write: true })
validateSchemaFilesExistAndParse()

const driftedArtifacts = detectArtifactDrift(generationResult.texts, GENERATED_DIR)
if (driftedArtifacts.length > 0) {
  throw new Error(
    `Generated artifacts drifted after write: ${driftedArtifacts.join(', ')}`,
  )
}

const diffResult = spawnSync('git', ['diff', '--exit-code', '--', ...GENERATED_RELATIVE_PATHS], {
  cwd: DESIGN_SYSTEM_ROOT,
  stdio: 'inherit',
})

if (diffResult.status !== 0) {
  process.exit(diffResult.status ?? 1)
}

console.log('Component governance check passed.')
