# Generated Artifact Governance

## Purpose

Generated artifact roots are machine-owned outputs. They should be validated separately from hand-authored source so the repo can govern them without forcing source-file naming rules onto generated material.

## Rules

1. Generated artifact roots must be declared explicitly.
2. Each generated root must declare:
   - maximum directory depth
   - allowed file extensions
   - allowlisted relative file paths when the directory is expected to stay filename-stable
   - required companion files when an artifact must ship with a schema or sidecar contract
3. Mixed-authoring package roots must be declared before generated subroots are carved out beneath them.
4. Generated subroots nested under mixed-authoring roots must be explicitly allowlisted as carve-outs.
5. Hidden directories and `node_modules` are ignored.
6. Files with undeclared extensions are violations.
7. Files outside the declared relative-path allowlist are violations.
8. Missing required companion files are violations.
9. Directories deeper than the declared maximum are violations.

## Initial rollout

Current generated artifact governance covers:

- `packages/design-system/generated`
- `packages/design-system/design-architecture/src`

These are intentionally separated from source-root governance because they are machine-owned JSON/CSS outputs rather than general source folders.

## Policy intent

- Use `allowedRelativePaths` when a generated root should contain an exact, predictable set of filenames.
- Use `requiredCompanionFiles` when generated data artifacts must ship with schemas or similar machine-readable sidecars.
- Use `mixedAuthoringRoots` when a package or parent directory contains both hand-authored material and machine-owned outputs, and generated governance should apply only to explicit carved-out subroots.
- Keep these rules narrow. If a generator emits a new file, the config should change in the same pull request as the generator.
