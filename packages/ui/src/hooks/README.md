# UI Package Hooks

This directory contains custom React hooks used throughout the UI package.

## Available Hooks

### `useIsMobile`

A hook that detects if the current viewport is mobile-sized (< 768px).

**Source:** Official shadcn/ui registry

**Usage:**

```tsx
import { useIsMobile } from '@afenda/ui/hooks'

function MyComponent() {
  const isMobile = useIsMobile()

  return <div>{isMobile ? 'Mobile View' : 'Desktop View'}</div>
}
```

**Features:**

- SSR-safe (returns `false` during server-side rendering)
- Automatically updates on window resize
- Uses `matchMedia` for efficient detection
- Breakpoint: 768px (configurable via `MOBILE_BREAKPOINT` constant)

**Returns:** `boolean` - `true` if viewport width is less than 768px, `false` otherwise

## shadcn/ui Hooks Registry

As of the latest check, shadcn/ui officially provides **1 hook** in their registry:

1. ✅ **use-mobile** - Already installed

### Adding More Hooks

To add hooks from the shadcn registry in the future:

```bash
cd packages/ui
npx shadcn@latest add [hook-name]
```

## Custom Hooks

If you need to add custom hooks not from shadcn/ui:

1. Create a new file: `src/hooks/use-your-hook.ts`
2. Export the hook function
3. Add the export to `src/hooks/index.ts`
4. Follow React hooks naming conventions (start with `use`)
5. Add documentation in this README

## Best Practices

- **Naming:** All hooks must start with `use` prefix
- **TypeScript:** Always provide proper type annotations
- **SSR:** Ensure hooks are SSR-safe when using browser APIs
- **Testing:** Add unit tests for complex hook logic
- **Documentation:** Update this README when adding new hooks
