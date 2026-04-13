```tsx
// invalid: local globals.css fork outside governed allowed owners
import "./globals.css"

export function StyleBindingInvalidFixture() {
  return <div>invalid style-binding import</div>
}
```

This should fail because the CSS import resolves to a local `globals.css` file
outside `styleBindingPolicy.allowedGlobalStyleOwners`.
