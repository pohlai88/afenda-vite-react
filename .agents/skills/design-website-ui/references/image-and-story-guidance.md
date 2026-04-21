# Image And Story Guidance

Read this reference when the task includes images, mockups, media blocks, or `*.stories.tsx`.

## Images

### Asset placement

- Page-owned image or illustration: keep it near the page or feature that owns it.
- Shared marketing visual: place it in a marketing-shared location only when multiple pages reuse it.
- Globally addressable asset: use `apps/web/public`.

Do not dump page-specific visuals into a global folder just because the path is shorter.

### Markup rules

- Informative image: meaningful `alt`
- Decorative image: `alt=""` and no misleading accessible label
- Provide `width` and `height` when practical
- Use `loading="lazy"` for below-the-fold images

### Design rules

- Use images to add proof, product explanation, or brand clarity.
- Avoid generic stock-art direction that weakens the page.
- Avoid fake product screenshots unless the user explicitly wants a conceptual mockup.
- When the real image is missing, prefer a structured placeholder surface, framed diagram, or proof panel over a random illustration.

### Common patterns

- Marketing hero image or mockup
- Proof or benchmark panel with supporting text
- Split content-and-media section
- Avatar or profile media in settings and account surfaces

## Stories

### Current repo status

Storybook is documented in `docs/dependencies/storybook.md`, but it is not installed in `apps/web` today. Treat story files as optional deliverables.

### When to add a story

- The user explicitly asks for Storybook stories
- The component needs state documentation and the repo area already uses Storybook
- The story is a handoff artifact for future Storybook adoption

### When not to add a story

- The user only asked for runtime UI code
- The change is purely internal and a story would add noise
- Storybook setup would require new config the user did not request

### Story content rules

- Cover real states: default, dense, loading, error, disabled, with-image, or mobile-constrained variants when relevant
- Use args and local fixtures
- Avoid live APIs, global app boot, or router complexity unless that is the point of the story
- Keep decorators small and purpose-specific

### Story location

- Prefer colocated `*.stories.tsx` when the area already follows that pattern
- Otherwise keep the file next to the component and call out that Storybook setup is still pending in `apps/web`
