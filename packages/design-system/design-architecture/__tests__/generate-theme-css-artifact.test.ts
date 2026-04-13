import { access, mkdtemp, readFile, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  buildArtifactThemeCssString,
  generateThemeCssArtifact,
} from '../scripts/generate-theme-css-artifact'
import { THEME_ARTIFACT_MANIFEST_SCHEMA_VERSION } from '../src/tokenization/token-manifest'

describe('generate-theme-css-artifact', () => {
  it('buildArtifactThemeCssString includes generator header, serialized core, and adapter sections', () => {
    const css = buildArtifactThemeCssString()

    expect(css).toContain('AUTO-GENERATED FILE')
    expect(css).toContain('SHADCN COMPATIBILITY ALIASES')
  })

  it('buildArtifactThemeCssString respects adapterOptions (e.g. disable required alias blocks)', () => {
    const full = buildArtifactThemeCssString()
    const noRequired = buildArtifactThemeCssString(undefined, {
      includeRequiredAliases: false,
    })

    expect(full).toContain('--background: var(--color-background);')
    expect(noRequired).not.toContain('--background: var(--color-background);')
  })

  it('generateThemeCssArtifact writes CSS and manifest beside output by default', async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'ds-theme-artifact-'))
    const cssPath = path.join(dir, 'generated-theme.css')

    try {
      await generateThemeCssArtifact({ outputFilePath: cssPath })

      const css = await readFile(cssPath, 'utf8')
      expect(css.length).toBeGreaterThan(0)
      expect(css).toContain('AUTO-GENERATED FILE')

      const manifestPath = path.join(dir, 'generated-theme.manifest.json')
      const raw = await readFile(manifestPath, 'utf8')
      const parsed = JSON.parse(raw) as {
        schemaVersion: number
        emitRevision: number
      }

      expect(parsed.schemaVersion).toBe(THEME_ARTIFACT_MANIFEST_SCHEMA_VERSION)
      expect(parsed.emitRevision).toBe(1)
    } finally {
      await rm(dir, { recursive: true, force: true })
    }
  })

  it('emitRevision is stable when regenerated output is unchanged', async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'ds-theme-artifact-'))
    const cssPath = path.join(dir, 'generated-theme.css')
    const manifestPath = path.join(dir, 'generated-theme.manifest.json')

    try {
      await generateThemeCssArtifact({ outputFilePath: cssPath })
      const r1 = JSON.parse(await readFile(manifestPath, 'utf8')) as {
        emitRevision: number
      }
      await generateThemeCssArtifact({ outputFilePath: cssPath })
      const r2 = JSON.parse(await readFile(manifestPath, 'utf8')) as {
        emitRevision: number
      }
      expect(r2.emitRevision).toBe(r1.emitRevision)
    } finally {
      await rm(dir, { recursive: true, force: true })
    }
  })

  it('emitRevision increments when emitted CSS bytes change', async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'ds-theme-artifact-'))
    const cssPath = path.join(dir, 'generated-theme.css')
    const manifestPath = path.join(dir, 'generated-theme.manifest.json')

    try {
      await generateThemeCssArtifact({ outputFilePath: cssPath })
      const r1 = JSON.parse(await readFile(manifestPath, 'utf8')) as {
        emitRevision: number
      }
      await generateThemeCssArtifact({
        outputFilePath: cssPath,
        adapterOptions: { includeRequiredAliases: false },
      })
      const r2 = JSON.parse(await readFile(manifestPath, 'utf8')) as {
        emitRevision: number
      }
      expect(r2.emitRevision).toBeGreaterThan(r1.emitRevision)
    } finally {
      await rm(dir, { recursive: true, force: true })
    }
  })

  it('generateThemeCssArtifact skips manifest when writeManifest is false', async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'ds-theme-artifact-'))
    const cssPath = path.join(dir, 'generated-theme.css')
    const manifestPath = path.join(dir, 'generated-theme.manifest.json')

    try {
      await generateThemeCssArtifact({
        outputFilePath: cssPath,
        writeManifest: false,
      })

      await access(cssPath)
      await expect(access(manifestPath)).rejects.toMatchObject({
        code: 'ENOENT',
      })
    } finally {
      await rm(dir, { recursive: true, force: true })
    }
  })

  it('manifest emittedContent matches the written CSS bytes (final artifact, not core-only)', async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'ds-theme-artifact-'))
    const cssPath = path.join(dir, 'generated-theme.css')

    try {
      await generateThemeCssArtifact({ outputFilePath: cssPath })

      const css = await readFile(cssPath, 'utf8')
      const raw = await readFile(
        path.join(dir, 'generated-theme.manifest.json'),
        'utf8',
      )
      const parsed = JSON.parse(raw) as {
        css: { byteLength: number; sha256: string }
      }

      const crypto = await import('node:crypto')
      const expectedSha = crypto
        .createHash('sha256')
        .update(css, 'utf8')
        .digest('hex')

      expect(parsed.css.byteLength).toBe(Buffer.byteLength(css, 'utf8'))
      expect(parsed.css.sha256).toBe(expectedSha)
    } finally {
      await rm(dir, { recursive: true, force: true })
    }
  })
})
