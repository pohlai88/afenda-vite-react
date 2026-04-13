import path from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  THEME_ARTIFACT_MANIFEST_SCHEMA_VERSION,
  buildThemeArtifactManifest,
  defaultThemeManifestPath,
  resolveEmitRevisionForArtifact,
  serializeThemeArtifactManifest,
  sha256ThemeArtifactContent,
  themeArtifactManifest,
} from '../src/tokenization/token-manifest'

describe('token-manifest', () => {
  it('builds a manifest with schema, generator, css, tokenization, and sections', () => {
    expect(themeArtifactManifest.schemaVersion).toBe(
      THEME_ARTIFACT_MANIFEST_SCHEMA_VERSION,
    )

    expect(themeArtifactManifest.generator.package).toBe(
      '@afenda/design-system',
    )

    expect(themeArtifactManifest.css.fileName).toBeDefined()
    expect(themeArtifactManifest.css.sha256).toMatch(/^[a-f0-9]{64}$/)
    expect(themeArtifactManifest.css.byteLength).toBeGreaterThan(0)
    expect(themeArtifactManifest.css.lineCount).toBeGreaterThan(0)

    expect(
      themeArtifactManifest.tokenization.themeStaticDeclarationCount,
    ).toBeGreaterThan(0)
    expect(
      themeArtifactManifest.tokenization.shadcnRegistryColorCount,
    ).toBeGreaterThan(0)

    expect(themeArtifactManifest.sections.emittedLineCount).toBeGreaterThan(0)

    expect(themeArtifactManifest.emitRevision).toBe(1)
  })

  it('serializes manifest deterministically', () => {
    const manifest = buildThemeArtifactManifest()
    const serializedA = serializeThemeArtifactManifest(manifest)
    const serializedB = serializeThemeArtifactManifest(manifest)

    expect(serializedA).toBe(serializedB)
    expect(serializedA.endsWith('\n')).toBe(true)
  })

  it('resolveEmitRevisionForArtifact starts at 1 without a previous manifest', () => {
    expect(resolveEmitRevisionForArtifact('a', undefined)).toBe(1)
  })

  it('resolveEmitRevisionForArtifact preserves revision when emitted CSS hash matches', () => {
    const css = '/* x */'
    const h = sha256ThemeArtifactContent(css)
    const previous = JSON.stringify({
      css: { sha256: h },
      emitRevision: 9,
    })
    expect(resolveEmitRevisionForArtifact(css, previous)).toBe(9)
  })

  it('resolveEmitRevisionForArtifact increments when emitted CSS hash differs', () => {
    const previous = JSON.stringify({
      css: { sha256: 'deadbeef'.repeat(8) },
      emitRevision: 3,
    })
    expect(resolveEmitRevisionForArtifact('new-bytes', previous)).toBe(4)
  })

  it('builds the default sidecar manifest path next to generated-theme.css', () => {
    const cssPath = path.join(
      'repo',
      'apps',
      'web',
      'src',
      'generated',
      'generated-theme.css',
    )
    expect(defaultThemeManifestPath(cssPath)).toBe(
      path.join(
        'repo',
        'apps',
        'web',
        'src',
        'generated',
        'generated-theme.manifest.json',
      ),
    )
  })
})
