# Afenda Website Design Workflow

Use this reference at the start of any website or landing-page task in this repo.

## Current Topology Snapshot

The live codebase currently centers website work in these areas:

- `apps/web/src/marketing`
  Public marketing and page-design surface.
- `apps/web/src/app/_features`
  Authenticated feature pages and feature-owned UI.
- `apps/web/src/app/_platform`
  Shared authenticated shell and platform runtime UI.
- `packages/design-system/ui-primitives`
  Reusable shadcn-style primitives shared across the app.

Do not assume older documentation that points to `apps/web/src/features` is fully current. Inspect the target tree first.

## Read Order By Task

### Marketing page or landing section

1. Read `docs/MARKETING_FRONTEND_CONTRACT.md`.
2. Read `apps/web/src/marketing/README.md`.
3. Read the nearest page under `apps/web/src/marketing/pages/*`.
4. Inspect `apps/web/src/marketing/pages/_components`.

### Shared website element or marketing scaffold

1. Read `docs/COMPONENTS_AND_STYLING.md`.
2. Read `docs/DESIGN_SYSTEM.md`.
3. Inspect existing primitives in `packages/design-system/ui-primitives`.
4. Inspect the nearest consumer page before expanding the primitive API.

### Authenticated shell or product page

1. Inspect the current feature or shell directory.
2. Read the closest existing component and its tests.
3. Use repo docs only to clarify intent or rules that are not obvious from the live code.

## Core Import Rules

- Shared primitives: `@afenda/design-system/ui-primitives`
- Class helper: `@afenda/design-system/utils`
- Marketing page scaffolds: relative imports from `apps/web/src/marketing/pages/_components`
- App-local shared UI: follow the import style already used in the edited area

Do not create a parallel `components/ui` tree when the design-system primitive already exists.

## Tailwind v4 And Styling Rules

- Use semantic tokens, not raw palette utilities.
- Reuse marketing classes from `marketing.css` and shared `ui-*` or shell classes before adding new globals.
- Prefer `gap-*` over `space-*`.
- Prefer `size-*` when width and height match.
- Prefer CSS layout over JS measurement for normal page composition.
- Keep gradients rare, proof-driven, and brand-aware.

## Escalation Rules

Use this order when deciding where a new visual pattern belongs:

1. Existing page-local composition
2. Existing marketing page scaffold
3. Existing design-system primitive
4. New marketing shared primitive or CSS class
5. New design-system primitive

Escalate only when the pattern is clearly reused, not because the first page feels important.

## Validation Matrix

### Page or section edits

- Typecheck the app or workspace
- Run relevant tests for the touched area
- Build when route, CSS, or imports changed materially

### Shared primitive edits

- Lint
- Typecheck
- Run affected tests
- Build if exports, CSS, or primitive contracts changed

### Story files

- Keep them fixture-based and compile-ready when Storybook exists
- If Storybook is absent, call the story file preparatory in the handoff
