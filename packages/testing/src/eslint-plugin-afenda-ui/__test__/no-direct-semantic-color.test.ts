import { createRequire } from 'node:module'
import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

const require = createRequire(import.meta.url)

const plugin = require('@afenda/eslint-config/afenda-ui-plugin') as {
  rules: {
    'no-direct-semantic-color': unknown
  }
}

RuleTester.describe = describe
RuleTester.it = it

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    parser: require('@typescript-eslint/parser'),
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
})

ruleTester.run(
  'no-direct-semantic-color',
  plugin.rules[
    'no-direct-semantic-color'
  ] as Parameters<typeof ruleTester.run>[1],
  {
    valid: [
      {
        code: `const view = <div className="bg-background text-foreground border-border flex gap-4" />`,
      },
      {
        code: `const view = <div className={cn("bg-muted border-border", isOpen && "text-foreground")} />`,
      },
      {
        code: `const view = <div className="text-sm bg-card text-card-foreground" />`,
      },
      {
        code: `const view = cn("bg-surface text-surface-foreground", isSelected && "border-border-strong")`,
      },
    ],

    invalid: [
      {
        code: `const view = <div className="bg-destructive text-destructive-foreground" />`,
        errors: [
          { messageId: 'noDirectSemanticColor', data: { token: 'bg-destructive' } },
          {
            messageId: 'noDirectSemanticColor',
            data: { token: 'text-destructive-foreground' },
          },
        ],
      },
      {
        code: `const view = <div className={cn("bg-warning/10", isActive && "text-warning")} />`,
        errors: [
          { messageId: 'noDirectSemanticColor', data: { token: 'bg-warning/10' } },
          { messageId: 'noDirectSemanticColor', data: { token: 'text-warning' } },
        ],
      },
      {
        code: `const view = <div className="dark:bg-primary hover:text-primary-foreground" />`,
        errors: [
          { messageId: 'noDirectSemanticColor', data: { token: 'dark:bg-primary' } },
          {
            messageId: 'noDirectSemanticColor',
            data: { token: 'hover:text-primary-foreground' },
          },
        ],
      },
      {
        code: `const classes = clsx("border-brand-500", isBroken ? "text-truth-broken" : "text-foreground")`,
        errors: [
          { messageId: 'noDirectSemanticColor', data: { token: 'border-brand-500' } },
          {
            messageId: 'noDirectSemanticColor',
            data: { token: 'text-truth-broken' },
          },
        ],
      },
    ],
  }
)
