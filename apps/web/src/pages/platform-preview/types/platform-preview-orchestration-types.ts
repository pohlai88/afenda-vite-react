export type TruthChamberId = "accountant" | "controller" | "cfo"

export type TruthRailId =
  | "distortion"
  | "evidence"
  | "governance"
  | "resolution"

export type TruthCaseId =
  | "wrong-account-class-posting"
  | "three-way-matching"
  | "intercompany-transfer"
  | "fiscal-period-drift"
  | "ifrs-reporting"
  | "xbrl-tagging"
  | "m-and-a"
  | "valuation"
  | "auditor-dispute"

export interface TruthFixtureItem {
  readonly id: string
  readonly label: string
  readonly value: string
}

export interface TruthRailSeed {
  readonly railId: TruthRailId
  readonly eyebrow: string
  readonly headline: string
  readonly body: string
  readonly fixtureItems: readonly TruthFixtureItem[]
  readonly riskSeverity: "contained" | "elevated" | "critical"
}

export interface TruthCaseSeed {
  readonly caseId: TruthCaseId
  readonly caseTitle: string
  readonly caseSignal: string
  readonly caseConsequence: string
  readonly rails: readonly [
    TruthRailSeed,
    TruthRailSeed,
    TruthRailSeed,
    TruthRailSeed,
  ]
}

export interface TruthChamberSeed {
  readonly chamberId: TruthChamberId
  readonly chamberTitle: string
  readonly chamberSubtitle: string
  readonly painPoints: readonly [string, string, string]
  readonly riskLine: string
  readonly statutoryPosture: string
  readonly visualTone: string
  readonly entryActionLabel: string
  readonly defaultCaseId: TruthCaseId
  readonly cases: readonly [TruthCaseSeed, TruthCaseSeed, TruthCaseSeed]
}

export interface TruthChamberViewModel {
  readonly chamberId: TruthChamberId
  readonly chamberTitle: string
  readonly chamberSubtitle: string
  readonly doctrineLine: string
  readonly riskLine: string
  readonly statutoryPosture: string
  readonly visualTone: string
  readonly activeCaseId: TruthCaseId
  readonly activeCase: TruthCaseSeed
  readonly cases: readonly TruthCaseSeed[]
}
