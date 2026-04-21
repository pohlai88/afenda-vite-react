---
name: design-website-ui
description: Design and implement website pages, landing sections, shared UI elements, and optional Storybook stories in Afenda's Vite app. Use when working on website or marketing design in `apps/web`, especially with Tailwind CSS v4, `@afenda/design-system/ui-primitives` shadcn-style components, responsive layouts, image blocks, feature cards, CTA sections, or `*.stories.tsx` deliverables.
---

# Design Website UI

## Overview

Design or refine website UI in this repo by composing the existing Afenda marketing shell, page scaffolds, and design-system primitives instead of inventing a new visual system. Trust the live codebase first, then use the docs to explain and reinforce the direction.

## Quick Start

1. Inspect the current target area before planning. The repo currently uses `apps/web/src/marketing`, `apps/web/src/app/_features`, and `apps/web/src/app/_platform`; do not assume older `src/features` notes are current.
2. Read `references/afenda-website-design-workflow.md`.
3. If the task includes images or stories, read `references/image-and-story-guidance.md`.
4. Reuse existing primitives before adding wrappers:
   - marketing page scaffolds in `apps/web/src/marketing/pages/_components`
   - shared primitives from `@afenda/design-system/ui-primitives`
   - `cn` from `@afenda/design-system/utils`
5. Implement only after the structure, ownership, and validation path are clear.

## Choose the Right Surface

- Marketing and public website work: start in `apps/web/src/marketing`.
- Authenticated product or ERP UI: inspect `apps/web/src/app/_features` and `apps/web/src/app/_platform` first.
- Shared reusable elements: change `packages/design-system/ui-primitives` only when the pattern clearly belongs beyond one page or feature.
- Stories: treat `*.stories.tsx` as optional output. Storybook is documented but not installed in `apps/web` today.

## Workflow

### 1. Inspect Before Designing

- Find the nearest existing page, section, shell block, or primitive.
- Follow the active import paths, file topology, and class vocabulary in that area.
- If code and docs disagree, trust the area you are editing and note the mismatch.

### 2. Compose Before Creating

- Prefer `MarketingPageShell`, `MarketingPageSection`, `MarketingSectionHeading`, `MarketingSectionKicker`, and existing marketing scaffolds before adding new page wrappers.
- Prefer `Button`, `Badge`, `Card`, `Input`, `Dialog`, `Tabs`, and other primitives from `@afenda/design-system/ui-primitives` before custom markup.
- Use `cn()` for conditional classes.

### 3. Style With Semantic Tokens

- Use Tailwind v4 semantic classes such as `bg-background`, `text-foreground`, `border-border`, `bg-primary`, `text-muted-foreground`, and token-driven opacity variants.
- Do not introduce raw `bg-blue-*`, `text-gray-*`, or ad hoc hex values in JSX.
- Prefer `gap-*`, `size-*`, `text-balance`, `text-pretty`, and clear grid/flex composition over spacing hacks.
- Keep gradients rare and intentional. Do not use gradient buttons or generic AI-style background clutter.

### 4. Keep The Design Intentional

- Make a clear visual choice: editorial, proof-led, benchmark-aware, or product-technical.
- Preserve accessibility, contrast, focus states, reduced motion, and mobile readability.
- Use animation only when it clarifies hierarchy or state.

### 5. Handle Images Deliberately

- Add images only when they improve proof, product explanation, or brand communication.
- Provide meaningful `alt` text and set decorative images to empty `alt` with explicit decorative treatment.
- Prefer feature-local or marketing-local assets for page-owned visuals. Use `apps/web/public` only for globally addressable assets.
- If the user has not provided a real image asset, prefer a structured placeholder surface or graphic treatment over inventing a fake product screenshot.

### 6. Write Stories Only When Needed

- Create `*.stories.tsx` only when the user asks for stories or the touched area already uses them.
- Keep stories state-driven, fixture-based, and free of live API calls.
- If Storybook is not installed in the target package, mention that the story file is preparatory and avoid adding `.storybook` config unless the user explicitly asks.

### 7. Validate

- Run the smallest meaningful set of checks for the touched area first.
- Standard repo checks are `pnpm run format:check`, `pnpm run lint`, `pnpm run typecheck`, `pnpm run test:run`, and `pnpm run build`.
- For focused work, prefer package or app scoped commands when faster, but do not skip calling out unrun validation.

## Templates

- Use `assets/marketing-media-section.template.tsx` for a website section with copy, proof items, CTA, and an image or mockup.
- Use `assets/element-grid.template.tsx` for a feature card grid or design-element section.
- Use `assets/component.stories.template.tsx` when the user explicitly wants a Storybook story file.

## Output Checklist

- Preserve the active topology and import conventions of the touched area.
- Export typed props for new reusable components.
- Keep semantics, labels, and keyboard behavior intact.
- Add tests or explicitly defer them with a reason.
- Mention when a story file is preparatory because Storybook is not yet installed.
