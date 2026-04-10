import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ShellBreadcrumbs } from '@/share/components/shell-ui/components/shell-breadcrumbs'
import { ShellLoadingFrame } from '@/share/components/shell-ui/components/shell-loading-frame'

describe('ShellBreadcrumbs', () => {
  it('exposes shell governance markers on nav', () => {
    render(
      <ShellBreadcrumbs data-testid="bc" aria-label="Breadcrumb">
        <span>Home</span>
      </ShellBreadcrumbs>,
    )
    const el = screen.getByTestId('bc')
    expect(el).toHaveAttribute('data-shell-key', 'shell-breadcrumbs')
    expect(el).toHaveAttribute('data-shell-zone', 'header')
    expect(el).toHaveTextContent('Home')
  })
})

describe('ShellLoadingFrame', () => {
  it('renders default skeletons and shell markers', () => {
    const { container } = render(<ShellLoadingFrame data-testid="lf" />)
    const el = screen.getByTestId('lf')
    expect(el).toHaveAttribute('data-shell-key', 'shell-loading-frame')
    expect(el).toHaveAttribute('data-shell-zone', 'content')
    expect(el).toHaveAttribute('role', 'status')
    expect(el).toHaveAttribute('aria-busy', 'true')
    expect(container.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThan(0)
  })

  it('allows custom children instead of skeletons', () => {
    render(
      <ShellLoadingFrame loadingLabel="Fetching">
        <div data-testid="custom">busy</div>
      </ShellLoadingFrame>,
    )
    expect(screen.getByTestId('custom')).toHaveTextContent('busy')
  })
})
