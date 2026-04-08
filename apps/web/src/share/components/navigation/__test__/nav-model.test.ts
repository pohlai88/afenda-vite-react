import { describe, expect, it } from 'vitest'

import { isTopNavItemActive, type TopNavItem } from '../nav-catalog/nav-model'

describe('isTopNavItemActive', () => {
  it('matches nested routes for non-exact items', () => {
    const item: TopNavItem = {
      label: 'Reports',
      to: '/app/reports',
    }

    expect(isTopNavItemActive('/app/reports/annual', item)).toBe(true)
    expect(isTopNavItemActive('/app/reports', item)).toBe(true)
    expect(isTopNavItemActive('/app/reporting', item)).toBe(false)
  })

  it('requires a full path + query match when the nav item contains a query', () => {
    const item: TopNavItem = {
      label: 'Invoices Overview',
      to: '/app/invoices?tab=overview',
    }

    expect(isTopNavItemActive('/app/invoices', item, '?tab=overview')).toBe(
      true,
    )
    expect(isTopNavItemActive('/app/invoices', item, '?tab=details')).toBe(
      false,
    )
  })

  it('uses the query string for exact matching', () => {
    const item: TopNavItem = {
      label: 'Dashboard',
      to: '/app/dashboard',
      exact: true,
    }

    expect(isTopNavItemActive('/app/dashboard', item)).toBe(true)
    expect(isTopNavItemActive('/app/dashboard', item, '?tab=overview')).toBe(
      false,
    )
  })
})
