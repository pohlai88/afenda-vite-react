```tsx
// valid: Next-style canonical owner import resolves to allowed global style owner
import "../globals.css"

export function StyleBindingValidGlobalsFixture() {
  return <div>valid globals.css style-binding import</div>
}
```

This should pass because the CSS import resolves to `apps/web/src/globals.css`,
which is listed in `styleBindingPolicy.allowedGlobalStyleOwners` (Next-style / shared globals entrypoint).
