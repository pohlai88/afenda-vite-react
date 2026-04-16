/**
 * PLATFORM PREVIEW TYPES
 *
 * Governed contracts for AFENDA's public role-play showcase.
 * These types support both:
 * - public-facing product preview
 * - internal UX / visual regression supervision
 *
 * Rules:
 * - keep contracts readonly and deterministic
 * - make role-play state a first-class concept
 * - allow one business scenario to be viewed through multiple roles
 * - keep runtime shell concerns out of this layer
 */

export type PreviewTone =
  | "default"
  | "muted"
  | "accent"
  | "info"
  | "success"
  | "warning"
  | "destructive"

export type PreviewDensity = "comfortable" | "compact"

export type PreviewTrend = "up" | "down" | "flat"

export type PreviewStatus =
  | "live"
  | "synced"
  | "nominal"
  | "healthy"
  | "verified"
  | "normalized"
  | "attention"
  | "delayed"
  | "degraded"
  | "blocked"

export type PreviewActionKind = "primary" | "secondary" | "ghost"

export type PreviewStoryKind =
  | "workspace"
  | "audit"
  | "control"
  | "integration"
  | "evidence"

export type PreviewRole = "controller" | "executive" | "owner" | "operator"

export type PreviewScenario =
  | "payment-release"
  | "month-end-close"
  | "audit-review"
  | "integration-exception"

export type PreviewMode = "preview" | "inspect"

export type PreviewTheme = "light" | "dark"

export type PreviewStress = "default" | "empty" | "degraded"

export interface PreviewAction {
  readonly id: string
  readonly label: string
  readonly kind: PreviewActionKind
  readonly href?: string
}

export interface PreviewMetric {
  readonly id: string
  readonly label: string
  readonly value: string
  readonly caption?: string
  readonly trend?: PreviewTrend
  readonly tone?: PreviewTone
}

export interface PreviewProofItem {
  readonly id: string
  readonly label: string
  readonly description?: string
  readonly tone?: PreviewTone
}

export interface PreviewScopeChip {
  readonly id: string
  readonly label: string
  readonly value: string
  readonly tone?: PreviewTone
}

export interface PreviewContextScope {
  readonly tenant: string
  readonly legalEntity: string
  readonly functionName: string
  readonly module: string
  readonly role?: string
  readonly region?: string
  readonly periodLabel?: string
  readonly chips?: ReadonlyArray<PreviewScopeChip>
}

export interface PreviewNavChild {
  readonly id: string
  readonly label: string
  readonly active?: boolean
  readonly badge?: string
}

export interface PreviewNavItem {
  readonly id: string
  readonly label: string
  readonly description: string
  readonly badge?: string
  readonly active?: boolean
  readonly iconKey?: string
  readonly children?: ReadonlyArray<PreviewNavChild>
}

export interface PreviewEventEvidence {
  readonly id: string
  readonly label: string
  readonly value: string
  readonly status?: PreviewStatus
  readonly tone?: PreviewTone
}

export interface PreviewEventCard {
  readonly id: string
  readonly eyebrow?: string
  readonly title: string
  readonly description: string
  readonly actor: string
  readonly timestamp: string
  readonly sla?: string
  readonly status?: PreviewStatus
  readonly tone?: PreviewTone
  readonly tags?: ReadonlyArray<string>
  readonly evidence?: ReadonlyArray<PreviewEventEvidence>
  readonly actions?: ReadonlyArray<PreviewAction>
}

export interface PreviewSignal {
  readonly id: string
  readonly label: string
  readonly status: PreviewStatus
  readonly description?: string
  readonly value?: string
  readonly trend?: PreviewTrend
  readonly tone?: PreviewTone
}

export interface PreviewInsightCard {
  readonly id: string
  readonly eyebrow?: string
  readonly title: string
  readonly description: string
  readonly meta: string
  readonly value?: string
  readonly tone?: PreviewTone
  readonly action?: PreviewAction
}

export interface PreviewStoryPanel {
  readonly id: string
  readonly kind: PreviewStoryKind
  readonly eyebrow?: string
  readonly title: string
  readonly description: string
  readonly bullets?: ReadonlyArray<string>
  readonly metrics?: ReadonlyArray<PreviewMetric>
  readonly tone?: PreviewTone
  readonly action?: PreviewAction
}

export interface PreviewHero {
  readonly eyebrow: string
  readonly title: string
  readonly description: string
  readonly badges: ReadonlyArray<string>
  readonly metrics: ReadonlyArray<PreviewMetric>
  readonly actions: ReadonlyArray<PreviewAction>
}

export interface PreviewCta {
  readonly title: string
  readonly description: string
  readonly actions: ReadonlyArray<PreviewAction>
}

export interface PreviewRoleBridge {
  readonly label: string
  readonly targetRole: PreviewRole
  readonly targetScenario?: PreviewScenario
  readonly teaser?: string
}

export interface PreviewRoleCard {
  readonly id: PreviewRole
  readonly label: string
  readonly shortLabel: string
  readonly iconKey: string
  readonly summary: string
  readonly hook: string
  readonly question: string
  readonly whatYouSee: ReadonlyArray<string>
  readonly bridgeUp?: PreviewRoleBridge
  readonly bridgeDown?: PreviewRoleBridge
}

export interface PreviewScenarioDefinition {
  readonly id: PreviewScenario
  readonly label: string
  readonly summary: string
  readonly continuity: ReadonlyArray<string>
}

export interface PreviewInspectState {
  readonly mode: PreviewMode
  readonly theme: PreviewTheme
  readonly density: PreviewDensity
  readonly stress: PreviewStress
}

export interface PlatformPreviewFixture {
  readonly id: string
  readonly slug: string
  readonly density: PreviewDensity

  readonly hero: PreviewHero
  readonly scope: PreviewContextScope

  readonly nav: ReadonlyArray<PreviewNavItem>
  readonly events: ReadonlyArray<PreviewEventCard>
  readonly signals: ReadonlyArray<PreviewSignal>
  readonly insights: ReadonlyArray<PreviewInsightCard>

  readonly proofStrip: ReadonlyArray<PreviewProofItem>
  readonly storyPanels: ReadonlyArray<PreviewStoryPanel>

  readonly cta: PreviewCta
}
