import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { AllocationView } from '../components/AllocationView'
import { SettlementView } from '../components/SettlementView'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) =>
      (
        {
          'allocation:header.title.label': 'Allocations',
          'allocation:error.over_allocated.message':
            'Allocated quantity exceeds available stock for this line.',
          'allocation:status.pending.label': 'Pending allocation',
          'settlement:header.title.label': 'Settlements',
          'settlement:status.pending.label': 'Pending settlement',
          'settlement:status.completed.label': 'Settled',
          'header.title.label': 'Title',
          'error.over_allocated.message':
            'Allocated quantity exceeds available stock for this line.',
          'status.pending.label': 'Pending settlement',
          'status.completed.label': 'Settled',
        }[key] ?? key
      ),
  }),
}))

vi.mock('../hooks', () => ({
  useFinanceActionBar: () => undefined,
}))

describe('finance semantic views', () => {
  it('renders allocation view with semantic alert content', () => {
    render(<AllocationView />)

    expect(screen.getAllByText('Title').length).toBeGreaterThan(0)
    expect(
      screen.getAllByText('Allocated quantity exceeds available stock for this line.')
        .length,
    ).toBeGreaterThan(0)
  })

  it('renders settlement view with governed settlement badges', () => {
    render(<SettlementView />)

    expect(screen.getAllByText('Pending settlement').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Settled').length).toBeGreaterThan(0)
  })
})
