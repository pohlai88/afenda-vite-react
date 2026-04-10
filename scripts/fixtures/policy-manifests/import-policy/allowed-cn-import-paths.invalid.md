```ts
// invalid: cn imported from non-governed relative path in feature/shared code
import { cn } from "../utils/cn"
```

Outside approved owner-source exemptions, this should trigger the non-governed `cn()` import rule.
