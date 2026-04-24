---
title: Feature Sync-Pack Definition Of Done
description: Acceptance criteria for the Sync-Pack SDK before GitHub submission and CI enforcement are enabled.
status: active
owner: governance-toolchain
truthStatus: canonical
docClass: canonical-doc
surfaceType: rules
relatedDomain: feature-sync-pack
order: 50
---

# Feature Sync-Pack Definition Of Done

## SDK Baseline

- Candidate schemas are Zod-backed and exported as TypeScript types.
- Pack generation always writes the 11-file fixed contract.
- Product Pack and Technical Pack sections render explicit `Not yet known` entries for unresolved decisions.
- Tech stack recommendations include the default Afenda stack and category override.

## Scaffold And Guardrails

- Scaffold CLI emits a package contract with dependency versions resolved from the workspace catalog where available.
- Doctor CLI detects guarded dependency drift, including Zod 3/4 and Tailwind 3/4 mismatches.
- Check CLI validates generated packs locally before a future GitHub Actions gate.
- FSDK-CONTRACT-001 validates package publication integrity before restricted SDK handoff.
- CLI JSON / CI output fails only on errors; warnings remain non-blocking.
- Root commands delegate through Turbo package tasks.

## Deferred Until After Scaffold Baseline

- GitHub pull request submission bundle.
- GitHub Actions blocking workflow.
- Automated PR comment/report publishing.
- External team onboarding workflow.
