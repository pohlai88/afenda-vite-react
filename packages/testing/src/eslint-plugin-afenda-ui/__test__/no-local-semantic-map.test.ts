import { createRequire } from 'node:module'
import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

const require = createRequire(import.meta.url)

const plugin = require('@afenda/eslint-config/afenda-ui-plugin') as {
  rules: {
    'no-local-semantic-map': unknown
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

ruleTester.run('no-local-semantic-map', plugin.rules['no-local-semantic-map'] as Parameters<typeof ruleTester.run>[1], {
  valid: [
    // Non-className record is fine
    {
      code: `const SEVERITY_LABELS: Record<ShellIntegritySeverity, string> = { valid: 'Valid', warning: 'Warning', broken: 'Broken', pending: 'Pending', neutral: 'Neutral' }`,
    },
    // Non-tailwind string values are fine
    {
      code: `const STATUS_ICONS = { valid: 'check', warning: 'alert', broken: 'x' }`,
    },
    // Plain data record without className fields
    {
      code: `const META: Record<string, { label: string; count: number }> = {}`,
    },
    // className in non-semantic-keyed record
    {
      code: `const layoutMap = { header: 'flex items-center', footer: 'border-t' }`,
    },
    {
      code: `const tone = ok ? 'bg-muted' : 'bg-background'`,
    },
    {
      code: `const surfaceMap = { default: 'bg-background', raised: 'bg-surface', text: 'text-foreground' }`,
    },
  ],

  invalid: [
    // Record with semantic type annotation + className Tailwind values
    {
      code: `const TONE_STYLES: Record<SemanticTone, { bg: string; text: string }> = { info: { bg: 'bg-info', text: 'text-info-foreground' } }`,
      errors: [{ messageId: 'noLocalSemanticMap' }],
    },
    // Variable named *ClassMap
    {
      code: `const alertToneClassMap = { info: 'bg-info text-info-foreground', warning: 'bg-warning text-warning-foreground' }`,
      errors: [{ messageId: 'noLocalSemanticMap' }],
    },
    // Variable named *ToneMap
    {
      code: `const severityToneMap = { valid: 'text-success', broken: 'text-destructive' }`,
      errors: [{ messageId: 'noLocalSemanticMap' }],
    },
    // Variable named *StyleMap
    {
      code: `const integrityStyleMap = { valid: 'bg-truth-valid', warning: 'bg-truth-warning' }`,
      errors: [{ messageId: 'noLocalSemanticMap' }],
    },
    // Variable named *SeverityMap
    {
      code: `const badgeSeverityMap = { broken: 'bg-destructive text-destructive-foreground', warning: 'bg-warning' }`,
      errors: [{ messageId: 'noLocalSemanticMap' }],
    },
    // Record<ShellIntegritySeverity, ...> with className fields
    {
      code: `const PRESENTATION: Record<ShellIntegritySeverity, IntegritySeverityPresentation> = { valid: { badgeClassName: 'bg-truth-valid', borderClassName: 'border-l-truth-valid', dotClassName: 'bg-truth-valid', iconClassName: 'text-truth-valid', pillClassName: 'bg-truth-valid-subtle', rowClassName: 'ui-row-valid', textClassName: 'text-truth-valid' } }`,
      errors: [{ messageId: 'noLocalSemanticMap' }],
    },
    // Record<SemanticEmphasis, ...> with className values
    {
      code: `const emphasisClassMap: Record<SemanticEmphasis, string> = { subtle: 'border-muted', default: 'border-border', strong: 'border-primary' }`,
      errors: [{ messageId: 'noLocalSemanticMap' }],
    },
    {
      code: `const badgeClassName = status === 'failed' ? 'bg-destructive text-destructive-foreground' : 'bg-warning text-warning-foreground'`,
      errors: [{ messageId: 'noLocalSemanticMap' }],
    },
    {
      code: `
        function getStatusClass(status: string) {
          switch (status) {
            case 'valid':
              return 'bg-success text-success-foreground'
            case 'warning':
              return 'bg-warning text-warning-foreground'
            case 'broken':
              return 'bg-destructive text-destructive-foreground'
            default:
              return 'bg-muted text-foreground'
          }
        }
      `,
      errors: [{ messageId: 'noLocalSemanticMap' }],
    },
    {
      code: `const statusPresentation = { valid: 'bg-success', warning: 'bg-warning', broken: 'bg-destructive' }`,
      errors: [{ messageId: 'noLocalSemanticMap' }],
    },
  ],
})
