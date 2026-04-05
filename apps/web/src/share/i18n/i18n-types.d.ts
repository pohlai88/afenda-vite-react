import type allocation from './locales/en/allocation.json'
import type auth from './locales/en/auth.json'
import type dashboard from './locales/en/dashboard.json'
import type invoice from './locales/en/invoice.json'
import type settlement from './locales/en/settlement.json'
import type shell from './locales/en/shell.json'

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'shell'
    returnNull: false
    resources: {
      shell: typeof shell
      auth: typeof auth
      dashboard: typeof dashboard
      invoice: typeof invoice
      allocation: typeof allocation
      settlement: typeof settlement
    }
  }
}

export {}
