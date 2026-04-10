import { createRequire } from 'node:module'
import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

const require = createRequire(import.meta.url)

const plugin = require('@afenda/eslint-config/afenda-ui-plugin') as {
  rules: {
    'no-direct-radix-outside-ui': unknown
  }
}

RuleTester.describe = describe
RuleTester.it = it

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    parser: require('@typescript-eslint/parser'),
  },
})

ruleTester.run(
  'no-direct-radix-outside-ui',
  plugin.rules[
    'no-direct-radix-outside-ui'
  ] as Parameters<typeof ruleTester.run>[1],
  {
    valid: [
      {
        filename:
          'C:/repo/packages/shadcn-ui/src/components/ui/dialog.tsx',
        code: `import * as DialogPrimitive from "@radix-ui/react-dialog"`,
      },
      {
        filename: 'C:/repo/apps/web/src/features/finance/view.tsx',
        code: `import { Button } from "@afenda/shadcn-ui/components/ui/button"`,
      },
      {
        filename: 'C:/repo/apps/web/src/features/finance/view.tsx',
        code: `import * as DialogPrimitive from "@radix-ui/react-dialog"`,
        options: [{ allowDirectRadixImportOutsideUiPackage: true }],
      },
    ],
    invalid: [
      {
        filename: 'C:/repo/apps/web/src/features/finance/view.tsx',
        code: `import * as DialogPrimitive from "@radix-ui/react-dialog"`,
        errors: [
          {
            messageId: 'directRadixOutsideUi',
            data: { packageName: '@radix-ui/react-dialog' },
          },
        ],
      },
      {
        filename: 'C:/repo/apps/web/src/share/components/nav.tsx',
        code: `import { Slot } from "@radix-ui/react-slot"`,
        errors: [
          {
            messageId: 'directRadixOutsideUi',
            data: { packageName: '@radix-ui/react-slot' },
          },
        ],
      },
      {
        filename: 'C:/repo/apps/web/src/features/finance/lazy.ts',
        code: `async function load() { return import("@radix-ui/react-tooltip") }`,
        errors: [
          {
            messageId: 'directRadixOutsideUi',
            data: { packageName: '@radix-ui/react-tooltip' },
          },
        ],
      },
    ],
  }
)
