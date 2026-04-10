import { render, screen } from "@testing-library/react"
import { createRef } from "react"
import { describe, expect, it } from "vitest"

import { SemanticAlert } from "../components/semantic-alert"
import {
  EvidenceBadge,
  IntegritySeverityBadge,
  SettlementBadge,
} from "../components/semantic-badge"
import { evidenceUiStateValues } from "../domain/evidence"
import { SemanticField } from "../components/semantic-field"
import { SemanticProgress } from "../components/semantic-progress"
import { SemanticTable } from "../components/semantic-table"
import { SemanticPanel } from "../components/semantic-panel"
import { SemanticSection } from "../components/semantic-section"
import { TableBody, TableCell, TableRow } from "../../components/ui/table"

describe("semantic components", () => {
  it("forwards refs for semantic surfaces", () => {
    const alertRef = createRef<HTMLDivElement>()
    const sectionRef = createRef<HTMLElement>()

    render(
      <div>
        <SemanticAlert ref={alertRef} tone="info" title="Heads up" />
        <SemanticSection ref={sectionRef} title="Overview">
          <p>Body</p>
        </SemanticSection>
      </div>
    )

    expect(alertRef.current).not.toBeNull()
    expect(sectionRef.current).not.toBeNull()
  })

  it("renders domain wrappers with governed labels", () => {
    render(<SettlementBadge state="settled" />)
    expect(screen.getByText("Settled")).not.toBeNull()
  })

  it("renders integrity severity badge via governed tone model", () => {
    render(<IntegritySeverityBadge severity="warning" />)
    expect(screen.getByText("Warning")).not.toBeNull()
  })

  it("renders every evidence badge state with governed labels", () => {
    const expectedLabelByState = {
      present: "Present",
      missing: "Missing",
      stale: "Stale",
      tampered: "Tampered",
      unverified: "Unverified",
    } as const

    for (const state of evidenceUiStateValues) {
      const { unmount } = render(<EvidenceBadge state={state} />)
      expect(screen.getByText(expectedLabelByState[state])).not.toBeNull()
      unmount()
    }
  })

  it("wires label and hint in semantic field", () => {
    render(
      <SemanticField id="email" label="Email" hint="Work email only">
        <input id="email" />
      </SemanticField>
    )

    expect(screen.getByLabelText("Email")).not.toBeNull()
    expect(screen.getByText("Work email only").getAttribute("id")).toBe("email-hint")
  })

  it("uses alert semantics for field errors", () => {
    render(
      <SemanticField id="invoice" label="Invoice" error="Invoice is required">
        <input id="invoice" />
      </SemanticField>
    )

    expect(screen.getByRole("alert").textContent).toContain("Invoice is required")
  })

  it("applies region labeling contracts for panel and section", () => {
    render(
      <SemanticPanel header={<h2>Settlement</h2>}>
        <SemanticSection title="Evidence">
          <p>Entries</p>
        </SemanticSection>
      </SemanticPanel>
    )

    expect(screen.getByRole("region", { name: "Settlement" })).not.toBeNull()
    expect(screen.getByRole("region", { name: "Evidence" })).not.toBeNull()
  })

  it("renders semantic progress with progressbar semantics", () => {
    render(<SemanticProgress label="Settlement progress" value={40} />)
    expect(screen.getByRole("progressbar")).not.toBeNull()
    expect(screen.getByText("40%")).not.toBeNull()
  })

  it("renders semantic table with loading and empty states", () => {
    const { rerender } = render(
      <SemanticTable title="Invoices" isLoading>
        <TableBody />
      </SemanticTable>
    )

    expect(screen.getByRole("status").textContent).toContain("Loading table data")

    rerender(
      <SemanticTable title="Invoices" isEmpty>
        <TableBody />
      </SemanticTable>
    )
    expect(screen.getByText("No data available.")).not.toBeNull()

    rerender(
      <SemanticTable title="Invoices">
        <TableBody>
          <TableRow>
            <TableCell>INV-001</TableCell>
          </TableRow>
        </TableBody>
      </SemanticTable>
    )
    expect(screen.getByText("INV-001")).not.toBeNull()
  })
})
