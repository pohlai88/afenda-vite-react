import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  buildGovernanceModel,
  createArtifactPayloads,
  detectArtifactDrift,
  serializeArtifacts,
  type NormalizedGovernanceComponent,
} from '../core'

describe('component governance integration', { timeout: 60_000 }, () => {
  it('produces deterministic full-scan outputs', async () => {
    const first = await buildGovernanceModel()
    const second = await buildGovernanceModel()

    expect(first.registryPrimitives.length).toBe(56)
    expect(first.components.length).toBe(56)
    expect(first).toEqual(second)

    const firstPayloads = createArtifactPayloads(first.components)
    const secondPayloads = createArtifactPayloads(second.components)
    expect(firstPayloads).toEqual(secondPayloads)
  })

  it('detects drift when variants change without regenerated artifacts', async () => {
    const { components } = await buildGovernanceModel()
    const payloads = createArtifactPayloads(components)
    const expectedTexts = serializeArtifacts(payloads)

    const tempRoot = fs.mkdtempSync(
      path.join(os.tmpdir(), 'afenda-component-governance-drift-'),
    )

    const staleVariantPayload = structuredClone(payloads)
    const firstComponent = staleVariantPayload.variants.components.find(
      (entry) => entry.cvaDefinitions.length > 0,
    )
    if (!firstComponent) {
      throw new Error(
        'Expected at least one variant-enabled component for drift test.',
      )
    }
    firstComponent.cvaDefinitions = []

    fs.writeFileSync(
      path.join(tempRoot, 'component-manifests.json'),
      expectedTexts.manifests,
    )
    fs.writeFileSync(
      path.join(tempRoot, 'component-coverage.json'),
      expectedTexts.coverage,
    )
    fs.writeFileSync(
      path.join(tempRoot, 'component-variants.json'),
      `${JSON.stringify(staleVariantPayload.variants, null, 2)}\n`,
    )

    const drifted = detectArtifactDrift(expectedTexts, tempRoot)
    expect(drifted).toContain('component-variants.json')
  })

  it('keeps variant artifacts stable for metadata-only manifest changes', async () => {
    const { components } = await buildGovernanceModel()
    const baseline = createArtifactPayloads(components)
    const baselineTexts = serializeArtifacts(baseline)

    const changedComponents: NormalizedGovernanceComponent[] = components.map(
      (component, index) =>
        index === 0
          ? {
              ...component,
              purpose: `${component.purpose} (metadata-only update)`,
            }
          : component,
    )

    const changed = createArtifactPayloads(changedComponents)
    const changedTexts = serializeArtifacts(changed)

    expect(changedTexts.variants).toBe(baselineTexts.variants)
    expect(changedTexts.manifests).not.toBe(baselineTexts.manifests)
  })
})
