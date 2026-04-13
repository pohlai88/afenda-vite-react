```tsx
// valid: Vite-style canonical owner import resolves to allowed global style owner
import "../index.css"

export function StyleBindingValidFixture() {
  return <div>valid style-binding import</div>
}
```

This should pass because the CSS import resolves to `apps/web/src/index.css`,
which is listed in `styleBindingPolicy.allowedGlobalStyleOwners` (Vite-style entrypoint).
