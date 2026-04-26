import {
  DEFAULT_VIETNAM_TAX_CONFIG,
  type VietnamTaxConfig,
} from "./finance-core.contract"

export type PITCalculationInput = {
  readonly grossIncome: number
  readonly insuranceSalary: number
  readonly dependentCount: number
  readonly otherDeductions?: number
  readonly config?: VietnamTaxConfig
}

export type PITCalculationResult = {
  readonly grossIncome: number
  readonly totalInsuranceEmployee: number
  readonly personalDeduction: number
  readonly dependentDeduction: number
  readonly otherDeductions: number
  readonly taxableIncome: number
  readonly assessableIncome: number
  readonly pitAmount: number
  readonly netIncome: number
  readonly effectiveRate: number
  readonly bhxhEmployee: number
  readonly bhytEmployee: number
  readonly bhtnEmployee: number
  readonly taxBracketBreakdown: readonly {
    readonly bracket: number
    readonly rate: number
    readonly income: number
    readonly tax: number
  }[]
}

export function calculatePIT(input: PITCalculationInput): PITCalculationResult {
  const config = input.config ?? DEFAULT_VIETNAM_TAX_CONFIG
  const otherDeductions = input.otherDeductions ?? 0
  const insuranceBase = Math.min(input.insuranceSalary, config.insuranceCeiling)

  const bhxhEmployee = insuranceBase * config.bhxhEmployeeRate
  const bhytEmployee = insuranceBase * config.bhytEmployeeRate
  const bhtnEmployee = insuranceBase * config.bhtnEmployeeRate
  const totalInsuranceEmployee = bhxhEmployee + bhytEmployee + bhtnEmployee

  const taxableIncome = input.grossIncome - totalInsuranceEmployee
  const personalDeduction = config.personalDeduction
  const dependentDeduction = input.dependentCount * config.dependentDeduction
  const assessableIncome = Math.max(
    0,
    taxableIncome - personalDeduction - dependentDeduction - otherDeductions
  )

  let pitAmount = 0
  let remainingIncome = assessableIncome
  const taxBracketBreakdown: {
    bracket: number
    rate: number
    income: number
    tax: number
  }[] = []

  for (const [index, bracket] of config.pitBrackets.entries()) {
    if (remainingIncome <= 0) {
      break
    }

    const previousMax =
      index === 0 ? 0 : config.pitBrackets[index - 1].maxIncome
    const bracketWidth = bracket.maxIncome - previousMax
    const incomeInBracket = Math.min(remainingIncome, bracketWidth)
    const tax = incomeInBracket * bracket.rate

    if (incomeInBracket > 0) {
      taxBracketBreakdown.push({
        bracket: index + 1,
        rate: bracket.rate,
        income: incomeInBracket,
        tax,
      })
    }

    pitAmount += tax
    remainingIncome -= incomeInBracket
  }

  const netIncome = input.grossIncome - totalInsuranceEmployee - pitAmount

  return {
    grossIncome: input.grossIncome,
    totalInsuranceEmployee,
    personalDeduction,
    dependentDeduction,
    otherDeductions,
    taxableIncome,
    assessableIncome,
    pitAmount,
    netIncome,
    effectiveRate: input.grossIncome > 0 ? pitAmount / input.grossIncome : 0,
    bhxhEmployee,
    bhytEmployee,
    bhtnEmployee,
    taxBracketBreakdown,
  }
}

export type EmployerContributionResult = {
  readonly bhxhEmployer: number
  readonly bhytEmployer: number
  readonly bhtnEmployer: number
  readonly totalEmployerContribution: number
  readonly totalLaborCost: number
}

export function calculateEmployerContributions(
  grossSalary: number,
  insuranceSalary: number,
  config: VietnamTaxConfig = DEFAULT_VIETNAM_TAX_CONFIG
): EmployerContributionResult {
  const insuranceBase = Math.min(insuranceSalary, config.insuranceCeiling)
  const bhxhEmployer = insuranceBase * config.bhxhEmployerRate
  const bhytEmployer = insuranceBase * config.bhytEmployerRate
  const bhtnEmployer = insuranceBase * config.bhtnEmployerRate
  const totalEmployerContribution = bhxhEmployer + bhytEmployer + bhtnEmployer

  return {
    bhxhEmployer,
    bhytEmployer,
    bhtnEmployer,
    totalEmployerContribution,
    totalLaborCost: grossSalary + totalEmployerContribution,
  }
}

export type VATCalculationResult = {
  readonly baseAmount: number
  readonly vatAmount: number
  readonly totalAmount: number
  readonly vatRate: number
}

export function calculateVATFromBase(
  baseAmount: number,
  vatRate = DEFAULT_VIETNAM_TAX_CONFIG.vatStandardRate
): VATCalculationResult {
  const vatAmount = baseAmount * vatRate
  return {
    baseAmount,
    vatAmount,
    totalAmount: baseAmount + vatAmount,
    vatRate,
  }
}

export function extractVATFromTotal(
  totalAmount: number,
  vatRate = DEFAULT_VIETNAM_TAX_CONFIG.vatStandardRate
): VATCalculationResult {
  const baseAmount = totalAmount / (1 + vatRate)
  return {
    baseAmount,
    vatAmount: totalAmount - baseAmount,
    totalAmount,
    vatRate,
  }
}

export type PayrollSummaryInput = {
  readonly grossSalary: number
  readonly insuranceSalary: number
  readonly dependentCount: number
  readonly workDays?: number
  readonly standardDays?: number
  readonly otHoursWeekday?: number
  readonly otHoursWeekend?: number
  readonly otHoursHoliday?: number
  readonly otRateWeekday?: number
  readonly otRateWeekend?: number
  readonly otRateHoliday?: number
  readonly allowances?: number
  readonly bonuses?: number
  readonly deductions?: number
}

export type PayrollSummaryResult = PITCalculationResult &
  EmployerContributionResult & {
    readonly workDays: number
    readonly standardDays: number
    readonly otHoursWeekday: number
    readonly otHoursWeekend: number
    readonly otHoursHoliday: number
    readonly otAmountWeekday: number
    readonly otAmountWeekend: number
    readonly otAmountHoliday: number
    readonly totalOTAmount: number
    readonly allowances: number
    readonly bonuses: number
    readonly totalEarnings: number
    readonly totalDeductionsAmount: number
  }

export function calculatePayrollSummary(
  input: PayrollSummaryInput,
  config: VietnamTaxConfig = DEFAULT_VIETNAM_TAX_CONFIG
): PayrollSummaryResult {
  const workDays = input.workDays ?? 22
  const standardDays = input.standardDays ?? 22
  const otHoursWeekday = input.otHoursWeekday ?? 0
  const otHoursWeekend = input.otHoursWeekend ?? 0
  const otHoursHoliday = input.otHoursHoliday ?? 0
  const otRateWeekday = input.otRateWeekday ?? 1.5
  const otRateWeekend = input.otRateWeekend ?? 2
  const otRateHoliday = input.otRateHoliday ?? 3
  const allowances = input.allowances ?? 0
  const bonuses = input.bonuses ?? 0
  const deductions = input.deductions ?? 0

  const hourlyRate = input.grossSalary / (standardDays * 8)
  const otAmountWeekday = otHoursWeekday * hourlyRate * otRateWeekday
  const otAmountWeekend = otHoursWeekend * hourlyRate * otRateWeekend
  const otAmountHoliday = otHoursHoliday * hourlyRate * otRateHoliday
  const totalOTAmount = otAmountWeekday + otAmountWeekend + otAmountHoliday
  const totalEarnings = input.grossSalary + totalOTAmount + allowances + bonuses

  const pit = calculatePIT({
    grossIncome: totalEarnings,
    insuranceSalary: input.insuranceSalary,
    dependentCount: input.dependentCount,
    otherDeductions: deductions,
    config,
  })
  const employer = calculateEmployerContributions(
    totalEarnings,
    input.insuranceSalary,
    config
  )

  return {
    ...pit,
    ...employer,
    workDays,
    standardDays,
    otHoursWeekday,
    otHoursWeekend,
    otHoursHoliday,
    otAmountWeekday,
    otAmountWeekend,
    otAmountHoliday,
    totalOTAmount,
    allowances,
    bonuses,
    totalEarnings,
    totalDeductionsAmount:
      pit.totalInsuranceEmployee + pit.pitAmount + deductions,
  }
}

export function formatVND(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount)
}

export function parseVND(value: string): number {
  return Number.parseInt(value.replace(/[^\d]/g, ""), 10) || 0
}

export function roundToThousand(amount: number): number {
  return Math.round(amount / 1000) * 1000
}
