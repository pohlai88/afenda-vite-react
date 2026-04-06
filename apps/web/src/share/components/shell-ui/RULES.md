# Shell UI Rules

This folder is for standalone shell-facing UI pieces only.

## Purpose

Components in this folder are small UI building blocks that can be embedded into
larger shell compositions such as top navigation, headers, sidebars, or page
chrome.

## Boundary Rule

- `shell-ui` contains standalone pieces only.
- If a component combines more than two primitives or starts orchestrating
  multiple concerns, it no longer belongs in `shell-ui`.
- Composite shell structures must live in a different slice.

## What Belongs Here

- Shell title
- Shell action slot
- Sidebar toggle button
- Small shell labels, dividers, badges, or status indicators

**Shell action triggers** (buttons that combine icon + label + badge, keyboard hints,
dropdown affordances, etc.) are **composed blocks**, not standalone primitives.
They live under **`block-ui/trigger/`** and are consumed by **`navigation/`** panels
and the top nav.

## What Does Not Belong Here

- Top navigation
- App header
- Sidebar
- Mobile navigation
- Footer
- Breadcrumb containers derived from routing and metadata
- Layout wrappers or shell composition roots
- Command palette dialog (belongs in `navigation`)
- Full notification or **truth alert** panels (those live in `navigation/`)
- **Trigger blocks** (belongs in `block-ui/trigger/`)
- **Theme / scope switch blocks** (belongs in `block-ui/switch-toggle/`)

## Anti-Dump Rules

- Do not place route-aware composite components here.
- Do not place provider implementations here.
- Do not place app-level layout wrappers here.
- Do not colocate auth, tenant, or navigation policy here.
- Do not let this folder become the default home for anything "shell-like".

## Composition Rule

Standalone `shell-ui` pieces may be consumed by larger components, but those
larger components must live outside this folder.

Examples:

- `shell-title.tsx` belongs here.
- `shell-action-slot.tsx` belongs here.
- `scope-switcher.tsx` / `theme-toggle.tsx` belong in **`block-ui/switch-toggle/`** (composed blocks).
- `trigger/command-palette-trigger.tsx` belongs in **`block-ui/trigger/`**, not here.
- `app-header.tsx` does not belong here.
- `top-nav.tsx` does not belong here.
- `command-palette.tsx` lives in **`search/`** (not `shell-ui`).

## Naming Policy

- Files and folders use kebab-case.
- Public exports go through `index.ts`.
- Names should describe the smallest reusable responsibility.
