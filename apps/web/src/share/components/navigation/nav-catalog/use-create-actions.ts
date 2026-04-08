import { useMemo } from 'react'
import {
  FileTextIcon,
  ShoppingCartIcon,
  UserCogIcon,
  UsersIcon,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

import type { CreateAction } from '../../block-ui/trigger/create-action-trigger'

/**
 * Returns the app-wide quick-create action list used in the top nav.
 * Centralised here so `TopNavBar` stays composition-only and the list
 * can be extended without touching the shell.
 */
export function useCreateActions(): CreateAction[] {
  const { t } = useTranslation('shell')

  return useMemo<CreateAction[]>(
    () => [
      {
        id: 'create-invoice',
        label: t('create.invoice' as never),
        to: '/app/invoices/new',
        icon: FileTextIcon,
      },
      {
        id: 'create-customer',
        label: t('create.customer' as never),
        to: '/app/customers/new',
        icon: UsersIcon,
      },
      {
        id: 'create-sale',
        label: t('create.sale' as never),
        to: '/app/sales/new',
        icon: ShoppingCartIcon,
      },
      { id: 'create-sep-after-sales', separator: true },
      {
        id: 'create-employee',
        label: t('create.employee' as never),
        to: '/app/employees/new',
        icon: UserCogIcon,
      },
    ],
    [t],
  )
}
