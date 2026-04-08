# Radix Primitives

## Afenda Canonical Context

Apply this skill with these project rules:

- Canonical design system package: `packages/radix-ui-themes`
- Build components from Radix primitives + Tailwind v4 + CVA
- Use semantic token classes and `data-[state=*]` variants
- Use `cn()` (`clsx` + `tailwind-merge`) for class composition
- Keep `@radix-ui/themes` limited to theme-provider context, not pre-styled component usage

Do not migrate or copy from deprecated `packages/ui` or `packages/design-system`.

Unstyled, accessible React components for building high-quality design systems.

## Overview

- Building custom styled components with full accessibility
- Understanding how shadcn/ui works under the hood
- Need polymorphic composition without wrapper divs
- Implementing complex UI patterns (modals, menus, tooltips)

## Primitives Catalog

### Overlay Components

| Primitive | Use Case |
| --- | --- |
| Dialog | Modal dialogs, forms, confirmations |
| AlertDialog | Destructive action confirmations |
| Sheet | Side panels, mobile drawers |

### Popover Components

| Primitive | Use Case |
| --- | --- |
| Popover | Rich content on trigger |
| Tooltip | Simple text hints |
| HoverCard | Preview cards on hover |
| ContextMenu | Right-click menus |

### Menu Components

| Primitive | Use Case |
| --- | --- |
| DropdownMenu | Action menus |
| Menubar | Application menubars |
| NavigationMenu | Site navigation |

### Form Components

| Primitive | Use Case |
| --- | --- |
| Select | Custom select dropdowns |
| RadioGroup | Single selection groups |
| Checkbox | Boolean toggles |
| Switch | On/off toggles |
| Slider | Range selection |

### Disclosure Components

| Primitive | Use Case |
| --- | --- |
| Accordion | Expandable sections |
| Collapsible | Single toggle content |
| Tabs | Tabbed interfaces |

## Core Pattern: asChild

The `asChild` prop enables polymorphic rendering without wrapper divs:

```tsx
// Without asChild - creates nested elements
<Button>
  <Link href="/about">About</Link>
</Button>

// With asChild - merges into single element
<Button asChild>
  <Link href="/about">About</Link>
</Button>
```

How it works:

- Uses Radix's internal `Slot` component
- Merges props from parent to child
- Forwards refs correctly
- Combines event handlers (both fire)
- Merges classNames

## Built-in Accessibility

Every primitive includes:

- Keyboard navigation: Arrow keys, Escape, Enter, Tab
- Focus management: Trap, return, visible focus rings
- ARIA attributes: Roles, states, properties
- Screen reader: Proper announcements

## Styling with Data Attributes

Radix exposes state via data attributes:

```css
/* Style based on state */
[data-state="open"] { /* open styles */ }
[data-state="closed"] { /* closed styles */ }
[data-disabled] { /* disabled styles */ }
[data-highlighted] { /* keyboard focus */ }
```

```tsx
// Tailwind arbitrary variants
<Dialog.Content className="data-[state=open]:animate-in data-[state=closed]:animate-out">
```

## Quick Reference

```tsx
import { Dialog, DropdownMenu, Tooltip } from 'radix-ui'

// Basic Dialog
<Dialog.Root>
  <Dialog.Trigger>Open</Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Overlay />
    <Dialog.Content>
      <Dialog.Title>Title</Dialog.Title>
      <Dialog.Description>Description</Dialog.Description>
      <Dialog.Close>Close</Dialog.Close>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
```

## Key Decisions

| Decision | Recommendation |
| --- | --- |
| Styling approach | Data attributes + Tailwind arbitrary variants |
| Composition | Use `asChild` to avoid wrapper divs |
| Animation | CSS-only with data-state selectors |
| Form components | Combine with react-hook-form |

## Related Skills

- `shadcn` - Pre-styled Radix components
- `radix-ui-design-system` - Full design system with Radix
- `tailwind-design-system` - Tailwind v4 design system patterns
