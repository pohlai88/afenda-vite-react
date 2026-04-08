import type { ComponentProps } from 'react'

import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { TopNavBar } from '../top-nav/top-nav-bar'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

const navData = {
  items: [{ label: 'Dashboard', to: '/app/dashboard', exact: true }],
  groups: [
    {
      id: 'main',
      label: 'Main',
      items: [{ label: 'Dashboard', to: '/app/dashboard', exact: true }],
    },
  ],
  secondaryItems: [],
}

const truthScopeState = {
  scope: {
    tenantId: 'org-1',
    legalEntityId: 'sub-1',
  },
  orgList: [{ id: 'org-1', name: 'Org 1' }],
  subsidiaryList: [
    {
      id: 'sub-1',
      name: 'Subsidiary 1',
      orgId: 'org-1',
      legalEntityCode: 'LE-1',
    },
  ],
  switchOrg: vi.fn(),
  switchSubsidiary: vi.fn(),
}

const truthHealthState = {
  health: null,
  alerts: [],
  markRead: vi.fn(),
  markAllRead: vi.fn(),
}

vi.mock('@/share/client-store', () => ({
  useTruthScopeStore: (selector: (state: typeof truthScopeState) => unknown) =>
    selector(truthScopeState),
  useTruthHealthStore: (
    selector: (state: typeof truthHealthState) => unknown,
  ) => selector(truthHealthState),
}))

vi.mock('@/share/components/providers', () => ({
  useGlobalSearch: () => ({
    isCommandPaletteOpen: false,
    setCommandPaletteOpen: vi.fn(),
    openCommandPalette: vi.fn(),
  }),
}))

vi.mock('../nav-catalog/use-nav-items', () => ({
  useNavItems: () => navData,
}))

vi.mock('../nav-catalog/use-create-actions', () => ({
  useCreateActions: () => [],
}))

vi.mock('../scope-strip/nav-breadcrumb-bar', () => ({
  NavBreadcrumbBar: () => <div data-testid="breadcrumb-bar" />,
}))

vi.mock('../mobile-nav/mobile-nav-drawer', () => ({
  MobileNavDrawer: () => <div data-testid="mobile-nav-drawer" />,
}))

vi.mock('../top-nav/top-nav-group-menu', () => ({
  TopNavGroupMenu: ({ group }: { group: { id: string; label: string } }) => (
    <div data-testid="top-nav-group">{group.label}</div>
  ),
}))

vi.mock('../top-nav/top-nav-link', () => ({
  TopNavLink: ({ item }: { item: { label: string } }) => (
    <div data-testid="top-nav-link">{item.label}</div>
  ),
}))

vi.mock('../top-nav/top-user-menu', () => ({
  TopUserMenu: () => <div data-testid="top-user-menu" />,
}))

vi.mock('../top-nav/top-action-bar', () => ({
  TopActionBar: () => <div data-testid="top-action-bar" />,
}))

vi.mock('../side-nav/side-nav-trigger', () => ({
  SideNavTrigger: () => (
    <button type="button" aria-label="Toggle Sidebar">
      Toggle Sidebar
    </button>
  ),
}))

vi.mock('../../search', () => ({
  buildNavGlobalSearchResults: () => [],
  CommandPalette: () => <div data-testid="command-palette" />,
  CommandPaletteBar: () => <div data-testid="command-palette-bar" />,
  GLOBAL_COMMAND_PALETTE_CONTENT_ID: 'global-command-palette-content',
  GLOBAL_SEARCH_NAV_TYPE: 'nav',
  GlobalSearchBar: () => <div data-testid="global-search-bar" />,
  useCommandPaletteShortcut: () => undefined,
}))

vi.mock('../../block-ui', () => ({
  CreateActionTrigger: () => <div data-testid="create-action-trigger" />,
  FeedbackPopover: () => <div data-testid="feedback-popover" />,
  HelpPanel: () => <div data-testid="help-panel" />,
  MobileNavTrigger: (props: ComponentProps<'button'>) => (
    <button type="button" data-testid="mobile-nav-trigger" {...props}>
      Open mobile nav
    </button>
  ),
  ResolutionPanel: () => <div data-testid="resolution-panel" />,
  TruthAlertPanel: () => <div data-testid="truth-alert-panel" />,
}))

describe('TopNavBar mobile branching', () => {
  it('does not render a top-bar sidebar trigger; rail footer owns collapse', () => {
    render(
      <TopNavBar
        features={{
          sidebarTrigger: false,
          mobileDrawer: false,
          commandPalette: false,
          globalSearch: false,
          feedback: false,
          createActions: false,
          truthAlerts: false,
          help: false,
          resolutions: false,
          actionBar: false,
        }}
      />,
    )

    expect(screen.queryByRole('button', { name: 'Toggle Sidebar' })).toBeNull()
    expect(screen.queryByTestId('mobile-nav-trigger')).toBeNull()
    expect(screen.queryByTestId('mobile-nav-drawer')).toBeNull()
  })

  it('renders the mobile drawer branch by default when items exist', () => {
    render(
      <TopNavBar
        features={{
          commandPalette: false,
          globalSearch: false,
          feedback: false,
          createActions: false,
          truthAlerts: false,
          help: false,
          resolutions: false,
          actionBar: false,
        }}
      />,
    )

    expect(screen.queryByRole('button', { name: 'Toggle Sidebar' })).toBeNull()
    expect(screen.getByTestId('mobile-nav-trigger')).not.toBeNull()
    expect(screen.getByTestId('mobile-nav-drawer')).not.toBeNull()
  })
})
