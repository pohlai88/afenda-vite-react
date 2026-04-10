import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import {
  AllocationBadge,
  InvariantAlert,
  SettlementBadge,
  getEvidenceUiModel,
} from '@afenda/shadcn-ui/semantic'

describe('semantic UI package', () => {
  it('renders domain badges with governed labels', () => {
    render(
      <div>
        <AllocationBadge state="allocated" />
        <SettlementBadge state="settled" />
      </div>,
    )

    expect(screen.getByText('Allocated')).not.toBeNull()
    expect(screen.getByText('Settled')).not.toBeNull()
  })

  it('renders invariant alerts with the correct live role', () => {
    render(
      <InvariantAlert
        severity="critical"
        description="Allocation drift requires intervention."
      />,
    )

    expect(screen.getByRole('alert')).not.toBeNull()
    expect(screen.getByText('Critical severity')).not.toBeNull()
  })

  it('keeps evidence adapter mappings deterministic', () => {
    expect(getEvidenceUiModel('tampered')).toMatchObject({
      tone: 'destructive',
      badgeLabel: 'Tampered',
    })
  })
})
