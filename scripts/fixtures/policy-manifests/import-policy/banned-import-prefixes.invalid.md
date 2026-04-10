```ts
// invalid: direct radix primitive import in non-owner source
import * as DialogPrimitive from "@radix-ui/react-dialog"
```

This should trigger the direct Radix import governance rule outside governed UI owners.
