import type { SVGProps } from 'react'

import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { NavConfigGroup, NavConfigItem } from '../nav-catalog/nav-config'
import { useNavItems } from '../nav-catalog/use-nav-items'

const storeMock = vi.hoisted(() => ({
  state: {
    currentUser: {
      id: 'user-1',
      name: 'Ada Lovelace',
      role: 'admin',
      permissions: ['reports:read', 'help:read'],
    },
  },
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('@/share/client-store/app-shell-store', () => ({
  useAppShellStore: (selector: (state: typeof storeMock.state) => unknown) =>
    selector(storeMock.state),
}))

function DummyIcon(props: SVGProps<SVGSVGElement>) {
  return <svg {...props} />
}

describe('useNavItems', () => {
  it('filters by permission and preserves group metadata', () => {
    const configGroups: readonly NavConfigGroup[] = [
      {
        id: 'management',
        labelKey: 'nav.group_management',
        showGroupLabel: true,
        collapsible: true,
        defaultExpanded: false,
        items: [
          {
            labelKey: 'nav.reports',
            path: 'reports',
            icon: DummyIcon,
            permissionKey: 'reports:read',
            badge: 3,
            notificationDot: true,
          },
          {
            labelKey: 'nav.settings',
            path: 'settings',
            icon: DummyIcon,
            permissionKey: 'settings:read',
          },
        ],
      },
    ]

    const secondaryConfig: readonly NavConfigItem[] = [
      {
        labelKey: 'nav.help',
        path: 'help',
        icon: DummyIcon,
        permissionKey: 'help:read',
      },
      {
        labelKey: 'nav.search',
        path: 'search',
        icon: DummyIcon,
        permissionKey: 'search:read',
      },
    ]

    const { result } = renderHook(() =>
      useNavItems(configGroups, secondaryConfig),
    )

    expect(result.current.items).toEqual([
      {
        label: 'nav.reports',
        to: '/app/reports',
        icon: DummyIcon,
        badge: 3,
        notificationDot: true,
        exact: undefined,
      },
    ])

    expect(result.current.groups).toEqual([
      {
        id: 'management',
        label: 'nav.group_management',
        items: result.current.items,
        showGroupLabel: true,
        collapsible: true,
        defaultExpanded: false,
      },
    ])

    expect(result.current.secondaryItems).toEqual([
      {
        label: 'nav.help',
        to: '/app/help',
        icon: DummyIcon,
        exact: undefined,
        badge: undefined,
        notificationDot: undefined,
      },
    ])
  })
})
