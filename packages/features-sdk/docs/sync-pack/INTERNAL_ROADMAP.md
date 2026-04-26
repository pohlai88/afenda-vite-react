---
title: Sync-Pack Internal Roadmap
description: Final internal roadmap state for @afenda/features-sdk and Sync-Pack.
status: active
owner: governance-toolchain
truthStatus: supporting
docClass: supporting-doc
surfaceType: docs
relatedDomain: feature-sync-pack
order: 25
---

# Sync-Pack Internal Roadmap

This roadmap is internal-first only.

## Now

The final internal slice now includes:

- deterministic root control console through `feature-sync`
- explicit daily operator workflow through `feature-sync:verify`
- decision-oriented ranking/report artifacts for candidate handoff
- generated implementation packs and scaffold handoff contracts
- intent governance through `feature-sync:intent` and `feature-sync:intent-check`
- golden example fitness through `feature-sync:sync-examples`
- package-first maintainer closure through `feature-sync:quality-validate`
- richer remediation in gated findings
- junior-facing docs that match the live CLI

## Next

maintenance and feature-factory hardening only.

There is no open package-boundary slice after this pass; future work should improve the Feature Factory pipeline without moving product implementation into this package.

## Later

These remain intentionally deferred:

- partner-restricted SDK mode
- public npm externalization
- public CLI packaging
- shell completion
- AI-assisted command generation
- broader CI/reporting layers beyond the current package-first surface
