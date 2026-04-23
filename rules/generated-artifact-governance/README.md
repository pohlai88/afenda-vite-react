# Generated Artifact Governance

This ruleset governs generated package artifacts that should stay machine-owned and format-constrained.

Artifacts in this directory:

- [`generated-artifact-governance.md`](./generated-artifact-governance.md): authoritative policy text
- [`generated-artifact-governance.config.json`](./generated-artifact-governance.config.json): machine-readable checker input
- [`generated-artifact-screening.md`](./generated-artifact-screening.md): generated screening report

How to use it:

1. Add a generated root here when the directory is machine-owned and should not be governed like hand-authored source.
2. Keep extension, exact relative-path allowlists, and companion-file requirements narrow so generated outputs stay predictable.
3. Declare mixed-authoring parent roots when generated outputs live inside broader package areas that still contain hand-authored material.
4. Run `pnpm run script:check-generated-artifact-governance` after updating generated files or their generators.
5. Treat root `pnpm run check` and the pre-commit hook as the enforcement path, not as optional documentation.

Scope:

- This policy is intentionally narrow and currently targets package JSON/CSS artifact roots.
- It exists separately from filesystem governance so generated outputs are not excluded by convention or treated like normal source folders.
- Use exact path allowlists when a generated directory should contain only a fixed set of filenames.
- Use companion requirements when a generated artifact must ship with a schema or parallel contract file.
- Use mixed-authoring parent declarations to prevent accidental expansion from a carved-out generated subroot to a broader hand-authored package area.
