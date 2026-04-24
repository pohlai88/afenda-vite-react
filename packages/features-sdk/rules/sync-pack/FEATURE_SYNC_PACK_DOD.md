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

## Internal-First Definition

A `@afenda/features-sdk` change is done when an internal Afenda developer can:

- discover the right command without prior package knowledge
- run the supported workflow without repo drift
- interpret failures with a clear next action
- generate or validate governed planning packs without breaking package contracts

This package is done for internal use before it is done for partner or public use.

## Critical: Must Be Great

- `pnpm run feature-sync` is deterministic quickstart only.
- `pnpm run feature-sync:verify` is the explicit daily workflow and remains opt-in.
- Release gates stay deterministic:
  - `release-check`
  - `check`
  - `doctor`
  - `validate`
- Read-only validation stays read-only:
  - check flows must not rewrite governance, waiver, or package evidence during validation
  - repair flows must stay explicit under sync/generate commands
- Generated planning packs always keep the fixed 11-file contract.
- Package contract validation keeps docs, rules, templates, exports, and bins aligned.
- Every gated error has either direct remediation in output or a documented fix path.
- Junior-facing docs exist and stay current:
  - getting started
  - junior DevOps quickstart
  - junior developer usage guide
  - command handbook
  - finding remediation catalog

## Essential: Must Be Good

- Candidate schemas are Zod-backed and exported as TypeScript types.
- Product Pack and Technical Pack sections render explicit `Not yet known` entries for unresolved decisions.
- Tech stack recommendations include the default Afenda stack and category override.
- Scaffold CLI emits a package contract with dependency versions resolved from the workspace catalog where available.
- Doctor CLI detects guarded dependency drift, including Zod 3/4 and Tailwind 3/4 mismatches.
- Root commands delegate through Turbo package tasks.
- Documentation includes a maintained internal roadmap with `Now`, `Next`, and `Later`.
- README surfaces explain package purpose, current features, and the safe operator path.

## Good To Have: Can Be Deferred

- GitHub pull request submission bundle.
- GitHub Actions blocking workflow.
- Automated PR comment/report publishing.
- Partner-restricted onboarding workflow.
- Public npm externalization.
- Interactive picker, shell completion, or AI-assisted command entry.

## Validation Checklist

Run these from the monorepo root for a full internal-ready check:

```txt
pnpm --filter @afenda/features-sdk build
pnpm run feature-sync
pnpm run feature-sync:help
pnpm run feature-sync:quality-validate
pnpm run feature-sync:verify
pnpm run feature-sync:release-check
pnpm run feature-sync:check
pnpm run feature-sync:doctor
pnpm run feature-sync:validate
```

Success means:

- `verify` completes without errors
- release gates report `errorCount = 0`
- `doctor` warnings, if any, are understood, carry remediation, and are intentionally non-blocking or explicitly waived
- `quality-validate` closes as `PASS` or accepted `WARN` with owned dispositions
- docs and generated surfaces remain aligned with the current rules and contracts

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
