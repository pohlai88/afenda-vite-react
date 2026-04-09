import { createRequire } from 'node:module'
import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

const require = createRequire(import.meta.url)

const plugin = require('@afenda/eslint-config/afenda-ui-plugin') as {
  rules: {
    'prefer-semantic-accessibility-governance': unknown
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
  'prefer-semantic-accessibility-governance',
  plugin.rules['prefer-semantic-accessibility-governance'] as Parameters<
    typeof ruleTester.run
  >[1],
  {
    valid: [
      {
        name: 'allows governed accessor usage',
        code: `import { getSemanticAccessibilityGovernance } from '../semantic/accessibility'
        const { conformance, policy, keyboardRequirements } = getSemanticAccessibilityGovernance()
        export function runCheck() {
          return policy.requireFocusVisible && conformance === 'AA' && keyboardRequirements.length > 0
        }`,
        filename: 'packages/shadcn-ui/src/semantic/internal/accessibility.ts',
      },
      {
        name: 'allows unrelated object literals',
        code: `const viewPolicy = { requireFocusVisible: enabled }`,
        filename: 'apps/web/src/features/finance/components/view.tsx',
      },
      {
        name: 'ignores test files',
        code: `const accessibilityPolicy = {
          requireFocusVisible: true,
          requireReducedMotionSupport: true,
        }`,
        filename: 'apps/web/src/features/finance/__test__/view.test.tsx',
      },
    ],
    invalid: [
      {
        name: 'rejects direct import from foundation accessibility constants',
        code: `import { accessibilityPolicy } from '../lib/constant/foundation/accessibility'
        export const policy = accessibilityPolicy`,
        filename: 'packages/shadcn-ui/src/semantic/internal/accessibility.ts',
        errors: [
          {
            messageId: 'noDirectDoctrineImport',
            data: {
              importPath: '../lib/constant/foundation/accessibility',
            },
          },
        ],
      },
      {
        name: 'rejects direct import from semantic internal accessibility module',
        code: `import { requireGovernedIconControlName } from '../../semantic/internal/accessibility'
        export const fn = requireGovernedIconControlName`,
        filename: 'apps/web/src/features/finance/components/view.tsx',
        errors: [
          {
            messageId: 'noDirectDoctrineImport',
            data: {
              importPath: '../../semantic/internal/accessibility',
            },
          },
        ],
      },
      {
        name: 'rejects inline accessibility policy doctrine',
        code: `const accessibilityPolicy = {
          requireFocusVisible: true,
          requireReducedMotionSupport: true,
          requireAccessibleNamesForIconOnlyControls: true,
        }`,
        filename: 'apps/web/src/features/finance/components/view.tsx',
        errors: [{ messageId: 'preferAccessor' }],
      },
      {
        name: 'rejects inline conformance doctrine',
        code: `const accessibilityConformance = 'AA'`,
        filename: 'apps/web/src/features/finance/components/view.tsx',
        errors: [{ messageId: 'preferAccessor' }],
      },
      {
        name: 'rejects inline keyboard requirements doctrine',
        code: `const keyboardRequirements = ['tab-order', 'focus-visible', 'escape-dismiss']`,
        filename: 'apps/web/src/features/finance/components/view.tsx',
        errors: [{ messageId: 'preferAccessor' }],
      },
    ],
  },
)
