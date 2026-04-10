```ts
// invalid: direct cva import in non-owner source
import { cva } from "class-variance-authority"
```

This should trigger the CVA import governance rule outside governed UI owners.
