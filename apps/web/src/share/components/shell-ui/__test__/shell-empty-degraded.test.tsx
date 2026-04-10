import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ShellDegradedFrame } from '@/share/components/shell-ui/components/shell-degraded-frame'
import { ShellEmptyStateFrame } from '@/share/components/shell-ui/components/shell-empty-state-frame'

describe('ShellEmptyStateFrame', () => {
  it('renders title, description, and shell markers', () => {
    render(
      <ShellEmptyStateFrame
        data-testid="es"
        title="Nothing here"
        description="Add a record to get started."
      />,
    )
    const el = screen.getByTestId('es')
    expect(el).toHaveAttribute('data-shell-key', 'shell-empty-state-frame')
    expect(el).toHaveAttribute('data-shell-zone', 'content')
    expect(screen.getByRole('region', { name: 'Nothing here' })).toBeTruthy()
    expect(screen.getByText('Nothing here')).toBeTruthy()
    expect(screen.getByText('Add a record to get started.')).toBeTruthy()
  })
})

describe('ShellDegradedFrame', () => {
  it('renders warning alert and shell markers', () => {
    render(
      <ShellDegradedFrame
        data-testid="dg"
        title="Degraded"
        description="Some features may be slow."
      />,
    )
    const el = screen.getByTestId('dg')
    expect(el).toHaveAttribute('data-shell-key', 'shell-degraded-frame')
    expect(el).toHaveAttribute('data-shell-zone', 'content')
    expect(screen.getByRole('alert')).toHaveTextContent('Degraded')
    expect(screen.getByText('Some features may be slow.')).toBeTruthy()
  })
})
