import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import {
  ShellContent,
  ShellHeader,
  ShellOverlayContainer,
  ShellRoot,
  ShellSearchBar,
  ShellSidebar,
  ShellTenantSwitcher,
  ShellWorkspaceSwitcher,
} from '@/share/components/shell-ui'

vi.mock('@/share/components/search/global-search-bar', () => ({
  GlobalSearchBar: () => <div data-testid="global-search-bar-mock" />,
}))

vi.mock('@/share/components/block-ui', () => ({
  ScopeSwitcher: () => <div data-testid="scope-switcher-mock" />,
}))

describe('ShellRoot', () => {
  it('renders children and governance markers', () => {
    render(
      <ShellRoot data-testid="sr">
        <span>inner</span>
      </ShellRoot>,
    )
    const el = screen.getByTestId('sr')
    expect(el).toHaveAttribute('data-shell-zone', 'root')
    expect(el).toHaveAttribute('data-shell-key', 'shell-root')
    expect(el).toHaveTextContent('inner')
  })
})

describe('ShellHeader', () => {
  it('renders children and shell markers', () => {
    render(
      <ShellHeader data-testid="sh">
        <span>title</span>
      </ShellHeader>,
    )
    const el = screen.getByTestId('sh')
    expect(el).toHaveAttribute('data-shell-key', 'shell-header')
    expect(el).toHaveTextContent('title')
  })
})

describe('ShellSidebar', () => {
  it('renders children', () => {
    render(
      <ShellSidebar data-testid="ss">
        <span>nav</span>
      </ShellSidebar>,
    )
    expect(screen.getByTestId('ss')).toHaveAttribute(
      'data-shell-key',
      'shell-sidebar',
    )
  })
})

describe('ShellContent', () => {
  it('renders children', () => {
    render(
      <ShellContent data-testid="sc">
        <span>main</span>
      </ShellContent>,
    )
    expect(screen.getByTestId('sc')).toHaveAttribute(
      'data-shell-key',
      'shell-content',
    )
  })
})

describe('ShellOverlayContainer', () => {
  it('establishes overlay shell marker', () => {
    render(
      <ShellOverlayContainer data-testid="soc">
        <span>x</span>
      </ShellOverlayContainer>,
    )
    expect(screen.getByTestId('soc')).toHaveAttribute(
      'data-shell-key',
      'shell-overlay-container',
    )
  })
})

describe('ShellSearchBar', () => {
  it('delegates to GlobalSearchBar', () => {
    render(
      <ShellSearchBar
        fetchResults={async () => []}
        getTypePresentation={() => undefined}
      />,
    )
    expect(screen.getByTestId('global-search-bar-mock')).not.toBeNull()
  })
})

describe('ShellTenantSwitcher', () => {
  it('wraps ScopeSwitcher with tenant shell marker', () => {
    const { container } = render(
      <ShellTenantSwitcher
        currentValue={null}
        items={[]}
        onSelect={() => undefined}
      />,
    )
    expect(container.querySelector('[data-shell-key="shell-tenant-switcher"]'))
      .toBeTruthy()
    expect(screen.getByTestId('scope-switcher-mock')).not.toBeNull()
  })
})

describe('ShellWorkspaceSwitcher', () => {
  it('wraps ScopeSwitcher with workspace shell marker', () => {
    const { container } = render(
      <ShellWorkspaceSwitcher
        currentValue={null}
        items={[]}
        onSelect={() => undefined}
      />,
    )
    expect(
      container.querySelector('[data-shell-key="shell-workspace-switcher"]'),
    ).toBeTruthy()
    expect(screen.getByTestId('scope-switcher-mock')).not.toBeNull()
  })
})
