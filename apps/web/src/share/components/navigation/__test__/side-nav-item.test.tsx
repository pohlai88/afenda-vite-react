import * as React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const sidebarMock = vi.hoisted(() => ({
  state: {
    isMobile: false,
    state: 'expanded' as 'expanded' | 'collapsed',
    setOpenMobile: vi.fn<(open: boolean) => void>(),
  },
}))

vi.mock('@afenda/ui/components/ui/sidebar', () => ({
  SidebarMenuItem: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SidebarMenuButton: ({
    children,
    asChild,
    isActive,
    tooltip,
  }: {
    children: React.ReactElement<Record<string, unknown>>
    asChild?: boolean
    isActive?: boolean
    tooltip?: string
  }) =>
    asChild
      ? React.cloneElement(children, {
          'data-active': String(Boolean(isActive)),
          'data-tooltip': tooltip,
        })
      : children,
  SidebarMenuBadge: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="side-nav-badge">{children}</span>
  ),
  useSidebar: () => sidebarMock.state,
}))

import { SideNavItem } from '../side-nav/side-nav-item'

describe('SideNavItem', () => {
  beforeEach(() => {
    sidebarMock.state.isMobile = false
    sidebarMock.state.state = 'expanded'
    sidebarMock.state.setOpenMobile.mockReset()
  })

  it('marks the active route with aria-current', () => {
    render(
      <MemoryRouter initialEntries={['/app/dashboard']}>
        <SideNavItem item={{ label: 'Dashboard', to: '/app/dashboard' }} />
      </MemoryRouter>,
    )

    expect(
      screen
        .getByRole('link', { name: 'Dashboard' })
        .getAttribute('aria-current'),
    ).toBe('page')
  })

  it('closes the mobile sheet when a route is activated on mobile', () => {
    sidebarMock.state.isMobile = true

    render(
      <MemoryRouter initialEntries={['/app/dashboard']}>
        <SideNavItem item={{ label: 'Dashboard', to: '/app/dashboard' }} />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('link', { name: 'Dashboard' }))

    expect(sidebarMock.state.setOpenMobile).toHaveBeenCalledWith(false)
  })

  it('renders a badge when badge prop is set', () => {
    render(
      <MemoryRouter initialEntries={['/app/dashboard']}>
        <SideNavItem item={{ label: 'Inbox', to: '/app/inbox', badge: 5 }} />
      </MemoryRouter>,
    )

    expect(screen.getByTestId('side-nav-badge').textContent).toBe('5')
  })

  it('does not render a badge when badge is undefined', () => {
    render(
      <MemoryRouter initialEntries={['/app/dashboard']}>
        <SideNavItem item={{ label: 'Home', to: '/app/home' }} />
      </MemoryRouter>,
    )

    expect(screen.queryByTestId('side-nav-badge')).toBeNull()
  })
})
