import { createConfig } from '@afenda/eslint-config'

const baseConfig = createConfig({ rootDir: import.meta.dirname })

export default [
  ...baseConfig,
  {
    name: 'ui-drift/import-fence',
    files: ['apps/**/*.{js,jsx,ts,tsx}', 'packages/**/*.{js,jsx,ts,tsx}'],
    ignores: [
      'packages/ui/src/**/*.{js,jsx,ts,tsx}',
      'packages/shadcn-ui/src/**/*.{js,jsx,ts,tsx}',
      'packages/design-system/src/components/shadcn/**/*.{js,jsx,ts,tsx}',
      '**/*.{test,spec}.{js,jsx,ts,tsx}',
      '**/*.stories.{js,jsx,ts,tsx}',
      '**/__tests__/**',
      '**/__test__/**',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@radix-ui/react-*'],
              message: 'Use governed wrapped primitives only.',
            },
            {
              group: ['class-variance-authority'],
              message: 'Define variants only in the governed UI package.',
            },
          ],
        },
      ],
    },
  },
]
