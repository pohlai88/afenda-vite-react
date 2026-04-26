import { describe, expect, it } from "vitest"

import {
  FinanceCoreError,
  calculateAccountBalance,
  calculateEmployerContributions,
  calculatePIT,
  calculatePayrollSummary,
  calculateTrialBalanceTotals,
  calculateVATFromBase,
  createReversalLines,
  extractVATFromTotal,
  formatAmountVND,
  generateJournalNumber,
  getAccountLevel,
  getFiscalPeriod,
  getParentAccountNumber,
  getPeriodDateRange,
  parseJournalNumber,
  parseVND,
  roundToThousand,
  validateAccountNumber,
  validateJournalInput,
} from "../src/index"

describe("@afenda/finance-core", () => {
  it("validates balanced journal input", () => {
    expect(() =>
      validateJournalInput({
        entryDate: new Date("2026-04-01T00:00:00.000Z"),
        description: "Accrual",
        lines: [
          { accountId: "1", debitAmount: 1000, creditAmount: 0 },
          { accountId: "2", debitAmount: 0, creditAmount: 1000 },
        ],
      })
    ).not.toThrow()

    expect(() =>
      validateJournalInput({
        entryDate: new Date("2026-04-01T00:00:00.000Z"),
        description: "Broken",
        lines: [
          { accountId: "1", debitAmount: 1000, creditAmount: 0 },
          { accountId: "2", debitAmount: 0, creditAmount: 900 },
        ],
      })
    ).toThrow(FinanceCoreError)
  })

  it("supports journal numbering and chart helpers", () => {
    const number = generateJournalNumber(
      new Date("2026-04-01T00:00:00.000Z"),
      12
    )
    expect(number).toBe("JE-202604-00013")
    expect(parseJournalNumber(number)).toEqual({
      prefix: "JE",
      year: 2026,
      month: 4,
      sequence: 13,
    })
    expect(validateAccountNumber("1111-01")).toBe(true)
    expect(getAccountLevel("1111-01-001")).toBe(3)
    expect(getParentAccountNumber("1111-01-001")).toBe("1111-01")
  })

  it("calculates balances, reversals, and fiscal periods", () => {
    expect(
      calculateAccountBalance(
        [
          { debitAmount: 100, creditAmount: 0 },
          { debitAmount: 50, creditAmount: 10 },
        ],
        "DEBIT"
      )
    ).toBe(140)

    expect(
      calculateTrialBalanceTotals([
        { debit: 100, credit: 0 },
        { debit: 0, credit: 100 },
      ])
    ).toMatchObject({ isBalanced: true, totalDebit: 100, totalCredit: 100 })

    expect(
      createReversalLines([
        { debitAmount: 100, creditAmount: 0, lineNumber: 1 },
      ])
    ).toEqual([{ debitAmount: 0, creditAmount: 100, lineNumber: 1 }])

    expect(getFiscalPeriod(new Date("2026-01-15T00:00:00.000Z"), 4)).toEqual({
      year: 2025,
      month: 1,
      period: 10,
    })

    expect(getPeriodDateRange(2026, 2).endDate.toISOString()).toBe(
      "2026-02-28T00:00:00.000Z"
    )
  })

  it("calculates Vietnam tax and payroll outputs", () => {
    const pit = calculatePIT({
      grossIncome: 30_000_000,
      insuranceSalary: 30_000_000,
      dependentCount: 1,
    })
    expect(pit.pitAmount).toBeGreaterThan(0)
    expect(pit.taxBracketBreakdown.length).toBeGreaterThan(0)

    const employer = calculateEmployerContributions(30_000_000, 30_000_000)
    expect(employer.totalEmployerContribution).toBeGreaterThan(0)

    const payroll = calculatePayrollSummary({
      grossSalary: 30_000_000,
      insuranceSalary: 30_000_000,
      dependentCount: 1,
      otHoursWeekday: 4,
      allowances: 1_000_000,
      bonuses: 2_000_000,
      deductions: 500_000,
    })
    expect(payroll.totalEarnings).toBeGreaterThan(30_000_000)
    expect(payroll.totalDeductionsAmount).toBeGreaterThan(0)
  })

  it("handles VAT and currency formatting helpers", () => {
    expect(calculateVATFromBase(1_000_000).totalAmount).toBe(1_100_000)
    expect(Math.round(extractVATFromTotal(1_100_000).baseAmount)).toBe(
      1_000_000
    )
    expect(formatAmountVND(990_000)).toContain("990")
    expect(parseVND("1.250.000 đ")).toBe(1_250_000)
    expect(roundToThousand(1_249_499)).toBe(1_249_000)
  })
})
