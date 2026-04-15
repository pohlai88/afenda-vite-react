/**
 * SHOWCASE SHELL PREVIEW
 *
 * Shared stage for the AFENDA role-play showcase.
 * This component morphs the same business movement through different
 * organizational lenses so visitors can compare perspectives quickly.
 *
 * Rules:
 * - one scenario, different role emphasis
 * - keep the shell visually credible but interaction-led
 * - inspect state should influence presentation, not business meaning
 * - preview remains deterministic for regression supervision
 */

import { AnimatePresence, motion } from "framer-motion"
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Eye,
  ReceiptText,
  Search,
} from "lucide-react"

import { Badge, Button } from "@afenda/design-system/ui-primitives"

import { platformPreviewFixture } from "../data/platform-preview-fixtures"
import {
  getPreviewRoleCard,
  getPreviewScenarioDefinition,
} from "../data/platform-preview-role-play"
import {
  getEvidenceHeading,
  getEvidencePriority,
  getInsightHeading,
  getInsightPriority,
  getPerspectiveBridgeNarrative,
  getRoleStage,
  getScenarioBridgeContext,
  getScenarioStage,
  getSignalHeading,
  getSignalPriority,
  getStressCopy,
  getTopBandHeading,
  getTopBandPriority,
} from "../config/platform-preview-stage-config"
import { previewMotion } from "../config/platform-preview-motion"
import {
  getNavIcon,
  getRoleIcon,
  getRoleLensIcon,
} from "../utils/platform-preview-icons"
import type {
  PreviewInspectState,
  PreviewRole,
  PreviewRoleBridge,
  PreviewScenario,
} from "../types/platform-preview-types"

export interface ShowcaseShellPreviewProps {
  readonly role: PreviewRole
  readonly scenario: PreviewScenario
  readonly inspectState: PreviewInspectState
  readonly onRoleJump?: (
    targetRole: PreviewRole,
    targetScenario?: PreviewScenario,
  ) => void
}

type StageBridgeTarget = {
  readonly bridge: PreviewRoleBridge
  readonly targetRoleLabel: string
  readonly targetRoleShortLabel: string
  readonly targetRoleIconKey: string
  readonly targetScenarioLabel: string
  readonly contextualTitle: string
  readonly contextualDescription: string
}

function titleCaseStatus(value: string) {
  return value
    .split("-")
    .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
    .join(" ")
}

function getScenarioEventOrder(
  scenario: PreviewScenario,
  highlightedEventId: string,
  eventIds: readonly string[],
) {
  const scenarioPriority: Record<PreviewScenario, readonly string[]> = {
    "payment-release": ["evt-1027", "evt-1026", "evt-1028"],
    "month-end-close": ["evt-1026", "evt-1027", "evt-1028"],
    "audit-review": ["evt-1028", "evt-1027", "evt-1026"],
    "integration-exception": ["evt-1026", "evt-1028", "evt-1027"],
  }

  const ordered = [...scenarioPriority[scenario]]
  if (!ordered.includes(highlightedEventId)) {
    ordered.unshift(highlightedEventId)
  }

  for (const id of eventIds) {
    if (!ordered.includes(id)) {
      ordered.push(id)
    }
  }

  return ordered
}

export function ShowcaseShellPreview({
  role,
  scenario,
  inspectState,
  onRoleJump,
}: ShowcaseShellPreviewProps) {
  const { nav, events, signals, insights } = platformPreviewFixture

  const roleStage = getRoleStage(role)
  const scenarioStage = getScenarioStage(scenario)
  const RoleIcon = getRoleLensIcon(role)
  const stressCopy = getStressCopy(inspectState.stress)
  const insightRailHeading = getInsightHeading(role)
  const signalHeading = getSignalHeading(role)
  const signalPriority = getSignalPriority(role)
  const perspectiveBridge = getPerspectiveBridgeNarrative(role, scenario)
  const evidenceHeading = getEvidenceHeading(role)
  const evidencePriorityOrder = getEvidencePriority(role)

  const topBandHeading = getTopBandHeading(role)
  const topBandPriority = getTopBandPriority(role, scenario)

  const orderedTopBand = [
    ...topBandPriority.filter((item) => scenarioStage.topBand.includes(item)),
    ...scenarioStage.topBand.filter((item) => !topBandPriority.includes(item)),
  ]

  const currentRoleCard = getPreviewRoleCard(role)

  const stageBridgeTargets: ReadonlyArray<StageBridgeTarget> = [
    currentRoleCard.bridgeUp,
    currentRoleCard.bridgeDown,
  ]
    .filter((value): value is PreviewRoleBridge => Boolean(value))
    .map((bridge) => {
      const targetRoleCard = getPreviewRoleCard(bridge.targetRole)
      const targetScenarioDef = getPreviewScenarioDefinition(
        bridge.targetScenario ?? scenario,
      )
      const context = getScenarioBridgeContext(
        scenario,
        targetRoleCard.shortLabel,
        targetScenarioDef.label,
      )

      return {
        bridge,
        targetRoleLabel: targetRoleCard.label,
        targetRoleShortLabel: targetRoleCard.shortLabel,
        targetRoleIconKey: targetRoleCard.iconKey,
        targetScenarioLabel: targetScenarioDef.label,
        contextualTitle: context.title,
        contextualDescription: context.description,
      }
    })

  const orderedEventIds = getScenarioEventOrder(
    scenario,
    roleStage.highlightedEventId,
    events.map((item) => item.id),
  )

  const orderedEvents = orderedEventIds
    .map((id) => events.find((event) => event.id === id))
    .filter((event): event is NonNullable<typeof event> => Boolean(event))

  const featuredEvent = orderedEvents[0]
  const secondaryEvents = orderedEvents.slice(1)

  const orderedFeaturedEvidence =
    featuredEvent?.evidence?.length && featuredEvent.evidence
      ? [
          ...evidencePriorityOrder
            .map((label) => featuredEvent.evidence!.find((item) => item.label === label))
            .filter((item): item is NonNullable<typeof item> => Boolean(item)),
          ...featuredEvent.evidence.filter(
            (item) => !evidencePriorityOrder.includes(item.label),
          ),
        ]
      : []

  const visibleSignals = [
    ...signalPriority
      .map((id) => signals.find((signal) => signal.id === id))
      .filter((signal): signal is NonNullable<typeof signal> => Boolean(signal)),
    ...signals.filter((signal) => !signalPriority.includes(signal.id)),
  ]

  const orderedInsightIds = getInsightPriority(role)

  const visibleInsights = orderedInsightIds
    .map((id) => insights.find((insight) => insight.id === id))
    .filter((insight): insight is NonNullable<typeof insight> => Boolean(insight))

  const compactClass =
    inspectState.density === "compact"
      ? {
          panel: "p-[0.9rem]",
          inset: "px-[0.8rem] py-[0.7rem]",
          text: "text-xs",
        }
      : {
          panel: "p-[1.1rem]",
          inset: "px-[0.95rem] py-[0.85rem]",
          text: "text-sm",
        }

  const stageMotionKey = [
    role,
    scenario,
    inspectState.stress,
    inspectState.density,
  ].join(":")

  const stageSurfaceClass =
    inspectState.theme === "dark"
      ? "border-border/80 bg-card/60"
      : "border-border/70 bg-card/45"

  return (
    <section className="mx-auto w-full max-w-none px-0">
      <div className={`overflow-hidden rounded-[2rem] border shadow-sm ${stageSurfaceClass}`}>
        <header className="border-b border-border/70 bg-background/90 px-[1rem] py-[1rem] md:px-[1.25rem]">
          <div className="grid gap-[0.9rem]">
            <div className="flex flex-wrap items-center gap-[0.625rem]">
              <span className="inline-flex items-center rounded-full border border-border/70 bg-card/70 px-[0.85rem] py-[0.45rem] text-[0.72rem] font-medium uppercase tracking-[0.13em] text-muted-foreground">
                {roleStage.label}
              </span>

              <Badge variant="outline" className="rounded-full px-[0.7rem] py-[0.2rem]">
                {scenarioStage.label}
              </Badge>

              <Badge variant="outline" className="rounded-full px-[0.7rem] py-[0.2rem]">
                {scenarioStage.riskLabel}
              </Badge>

              <div className="ml-auto flex flex-wrap items-center gap-[0.5rem]">
                <Button variant="outline" size="sm">
                  Switch perspective
                </Button>
                <Button size="sm">Follow this event</Button>
              </div>
            </div>

            <div>
              <div className="mb-[0.35rem] text-[0.68rem] uppercase tracking-[0.11em] text-muted-foreground">
                {topBandHeading}
              </div>

              <div data-testid="preview-stage-top-band">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={`${role}:${scenario}:top-band`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{
                      duration: 0.18,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="flex flex-wrap gap-[0.5rem]"
                  >
                    {orderedTopBand.map((item, index) => (
                      <div
                        key={item}
                        className={
                          index === 0
                            ? "rounded-full border border-border bg-card px-[0.75rem] py-[0.45rem] text-[0.78rem] font-semibold tracking-tight"
                            : "rounded-full border border-border/60 bg-card/60 px-[0.75rem] py-[0.45rem] text-[0.78rem] font-medium tracking-tight text-muted-foreground"
                        }
                      >
                        {item}
                      </div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            <div className="grid gap-[0.75rem] xl:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)]">
              <div>
                <div className="flex items-start gap-[0.7rem]">
                  <div className="rounded-[0.95rem] border border-border/60 bg-background/80 p-[0.65rem]">
                    {/* eslint-disable-next-line react-hooks/static-components -- RoleIcon is a stable lucide component from resolver */}
                    <RoleIcon className="size-4" />
                  </div>

                  <div>
                    <div className="text-[1.15rem] font-semibold tracking-tight md:text-[1.35rem]">
                      {roleStage.focusTitle}
                    </div>
                    <p className="mt-[0.35rem] max-w-3xl text-sm leading-6 text-muted-foreground">
                      {roleStage.focusDescription}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.35rem] border border-border/60 bg-card/55 p-[0.95rem]">
                <div className="text-[0.72rem] uppercase tracking-[0.12em] text-muted-foreground">
                  Inspect posture
                </div>
                <div className="mt-[0.35rem] text-sm font-semibold tracking-tight">
                  {stressCopy.label}
                </div>
                <p className="mt-[0.35rem] text-xs leading-5 text-muted-foreground">
                  {stressCopy.description}
                </p>

                <div className="mt-[0.7rem] flex flex-wrap gap-[0.45rem]">
                  <Badge variant="outline" className="rounded-full">
                    {inspectState.mode}
                  </Badge>
                  <Badge variant="outline" className="rounded-full">
                    {inspectState.theme}
                  </Badge>
                  <Badge variant="outline" className="rounded-full">
                    {inspectState.density}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="grid min-h-[50rem] grid-cols-1 lg:grid-cols-[16.5rem_minmax(0,1fr)_21rem]">
          <aside className="border-b border-border/70 bg-background/72 p-[1rem] lg:border-b-[length:0] lg:border-r">
            <div className="rounded-[1.35rem] border border-border/70 bg-card/60 px-[1rem] py-[0.9rem] shadow-sm">
              <div className="flex items-center gap-[0.625rem] text-sm text-muted-foreground">
                <Search className="size-4" />
                <span>Explore what each role sees</span>
              </div>
            </div>

            <div className="mt-[1rem] space-y-[0.875rem]">
              {nav.map((group) => {
                const GroupIcon = getNavIcon(group.iconKey)

                return (
                  <section
                    key={group.id}
                    className="rounded-[1.35rem] border border-border/60 bg-card/45 p-[0.875rem] shadow-sm"
                  >
                    <div className="mb-[0.75rem] flex items-start justify-between gap-[0.75rem]">
                      <div className="flex items-start gap-[0.75rem]">
                        <div className="rounded-[0.9rem] border border-border/60 bg-background/80 p-[0.55rem]">
                          <GroupIcon className="size-4" />
                        </div>
                        <div>
                          <div className="text-sm font-medium tracking-tight">{group.label}</div>
                          <div className="text-xs leading-5 text-muted-foreground">
                            {group.description}
                          </div>
                        </div>
                      </div>

                      {group.badge ? (
                        <Badge variant="outline" className="rounded-full">
                          {group.badge}
                        </Badge>
                      ) : null}
                    </div>

                    <div className="space-y-[0.45rem]">
                      {group.children?.map((item) => (
                        <div
                          key={item.id}
                          className={
                            item.active
                              ? "flex items-center justify-between rounded-[1rem] border border-border bg-background px-[0.8rem] py-[0.7rem] text-sm shadow-sm"
                              : "flex items-center justify-between rounded-[1rem] px-[0.8rem] py-[0.7rem] text-sm text-muted-foreground"
                          }
                        >
                          <span>{item.label}</span>
                          <div className="flex items-center gap-[0.4rem]">
                            {item.badge ? (
                              <Badge variant="outline" className="rounded-full">
                                {item.badge}
                              </Badge>
                            ) : null}
                            {item.active ? <ChevronRight className="size-4" /> : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )
              })}
            </div>

            <div className="mt-[1rem] rounded-[1.35rem] border border-border/60 bg-card/45 p-[1rem] shadow-sm">
              <div className="text-[0.72rem] uppercase tracking-[0.12em] text-muted-foreground">
                This role is watching for
              </div>
              <div className="mt-[0.75rem] flex flex-wrap gap-[0.5rem]">
                {roleStage.chips.map((chip) => (
                  <div
                    key={chip}
                    className="rounded-full border border-border/60 bg-background/75 px-[0.75rem] py-[0.45rem] text-[0.78rem] font-medium tracking-tight"
                  >
                    {chip}
                  </div>
                ))}
              </div>

              <div className="mt-[0.9rem] grid gap-[0.55rem]">
                {roleStage.summaryCards.map((card) => (
                  <div
                    key={card.id}
                    className="rounded-[1rem] border border-border/60 bg-background/75 px-[0.85rem] py-[0.75rem]"
                  >
                    <div className="text-[0.72rem] uppercase tracking-[0.12em] text-muted-foreground">
                      {card.label}
                    </div>
                    <div className="mt-[0.2rem] text-sm font-semibold tracking-tight">
                      {card.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <main className="bg-background/60 p-[1rem] md:p-[1.15rem]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={stageMotionKey}
                initial={{ opacity: 0, y: 10, scale: 0.995 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.995 }}
                transition={previewMotion.layout}
                className="grid gap-[1rem]"
              >
                <div className="rounded-[1.35rem] border border-border/60 bg-card/50 px-[1rem] py-[0.9rem] shadow-sm">
                  <div className="grid gap-[0.875rem] xl:grid-cols-[minmax(0,1.15fr)_minmax(16rem,0.85fr)] xl:items-start">
                    <div>
                      <div className="text-[0.72rem] uppercase tracking-[0.12em] text-muted-foreground">
                        Shared scenario
                      </div>
                      <div className="mt-[0.25rem] text-[1rem] font-semibold tracking-tight">
                        {scenarioStage.stageTitle}
                      </div>
                      <p className="mt-[0.25rem] text-sm leading-6 text-muted-foreground">
                        {scenarioStage.stageDescription}
                      </p>

                      <div className="mt-[0.75rem] rounded-[1rem] border border-border/60 bg-background/75 px-[0.9rem] py-[0.8rem]">
                        <div className="text-[0.68rem] uppercase tracking-[0.11em] text-muted-foreground">
                          {roleStage.stageEyebrow}
                        </div>
                        <p className="mt-[0.35rem] text-sm leading-6 text-muted-foreground">
                          {roleStage.stageRoleSummary}
                        </p>
                      </div>
                    </div>

                    <div>
                      <div className="mb-[0.35rem] text-[0.68rem] uppercase tracking-[0.11em] text-muted-foreground">
                        {roleStage.continuityFocusLabel}
                      </div>
                      <div className="flex flex-wrap gap-[0.45rem]">
                        {scenarioStage.continuity.map((step, index) => (
                          <div
                            key={step}
                            className={
                              index === 0
                                ? "rounded-full border border-border bg-background px-[0.7rem] py-[0.4rem] text-[0.75rem] font-semibold tracking-tight"
                                : "rounded-full border border-border/60 bg-background/75 px-[0.7rem] py-[0.4rem] text-[0.75rem] font-medium tracking-tight text-muted-foreground"
                            }
                          >
                            {step}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {inspectState.stress === "empty" ? (
              <article className={`rounded-[1.75rem] border border-dashed border-border/70 bg-card/45 shadow-sm ${compactClass.panel}`}>
                <div className="flex items-start gap-[0.75rem]">
                  <Clock3 className="mt-[0.1rem] size-4" />
                  <div>
                    <div className="text-[1.1rem] font-semibold tracking-tight">
                      Quiet surface, still readable
                    </div>
                    <p className="mt-[0.35rem] max-w-2xl text-sm leading-6 text-muted-foreground">
                      Low traffic should still read intentional — same workspace, quieter inputs.
                    </p>
                  </div>
                </div>
              </article>
            ) : (
              <div className="grid gap-[1rem]">
                {featuredEvent ? (
                  <article
                    data-testid="preview-featured-event"
                    className={`rounded-[1.95rem] border border-border/70 bg-card/60 shadow-sm ${compactClass.panel}`}
                  >
                    <div className="flex flex-col gap-[1rem]">
                      <div className="flex flex-col gap-[0.9rem] md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0">
                          {featuredEvent.eyebrow ? (
                            <div className="text-[0.74rem] uppercase tracking-[0.13em] text-muted-foreground">
                              {featuredEvent.eyebrow}
                            </div>
                          ) : null}

                          <div className="mt-[0.35rem] flex flex-wrap items-center gap-[0.55rem]">
                            <h3 className="text-[1.35rem] font-semibold tracking-tight md:text-[1.55rem]">
                              {featuredEvent.title}
                            </h3>
                            <Badge variant="outline" className="rounded-full">
                              featured for {roleStage.label.toLowerCase()}
                            </Badge>
                          </div>

                          <p className="mt-[0.65rem] max-w-3xl text-sm leading-6 text-muted-foreground">
                            {featuredEvent.description}
                          </p>
                        </div>

                        {featuredEvent.status ? (
                          <Badge className="rounded-full md:shrink-0">
                            {titleCaseStatus(featuredEvent.status)}
                          </Badge>
                        ) : null}
                      </div>

                      {(featuredEvent.tags?.length ?? 0) > 0 ? (
                        <div className="flex flex-wrap gap-[0.5rem]">
                          {featuredEvent.tags?.map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="rounded-full px-[0.65rem] py-[0.2rem]"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      ) : null}

                      {orderedFeaturedEvidence.length > 0 ? (
                        <motion.div
                          key={`${role}:${featuredEvent.id}:evidence`}
                          data-testid="preview-featured-evidence"
                          className="grid gap-[0.625rem]"
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={previewMotion.content}
                        >
                          <div className="text-[0.72rem] uppercase tracking-[0.12em] text-muted-foreground">
                            {evidenceHeading}
                          </div>
                          <div className="grid gap-[0.625rem] md:grid-cols-2 xl:grid-cols-3">
                            {orderedFeaturedEvidence.map((evidence) => (
                              <div
                                key={evidence.id}
                                className={`rounded-[1rem] border border-border/60 bg-background/75 ${compactClass.inset}`}
                              >
                                <div className="text-[0.72rem] uppercase tracking-[0.12em] text-muted-foreground">
                                  {evidence.label}
                                </div>
                                <div className="mt-[0.3rem] text-sm font-semibold tracking-tight">
                                  {evidence.value}
                                </div>
                                {evidence.status ? (
                                  <div className="mt-[0.35rem] text-xs text-muted-foreground">
                                    {titleCaseStatus(evidence.status)}
                                  </div>
                                ) : null}
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      ) : null}

                      <div className="grid gap-[0.75rem] xl:grid-cols-[minmax(0,1.05fr)_minmax(15rem,0.95fr)]">
                        <div className="rounded-[1rem] border border-border/60 bg-background/75 px-[0.95rem] py-[0.85rem]">
                          <div className="text-[0.72rem] uppercase tracking-[0.12em] text-muted-foreground">
                            {roleStage.featuredFrameLabel}
                          </div>
                          <div className="mt-[0.3rem] text-sm font-semibold tracking-tight">
                            {roleStage.primaryQuestion}
                          </div>
                          <p className="mt-[0.35rem] text-sm leading-6 text-muted-foreground">
                            {roleStage.featuredFrameSummary}
                          </p>
                        </div>

                        <div className="rounded-[1rem] border border-border/60 bg-background/75 px-[0.95rem] py-[0.85rem]">
                          <div className="text-[0.72rem] uppercase tracking-[0.12em] text-muted-foreground">
                            Role emphasis
                          </div>
                          <p className="mt-[0.35rem] text-sm leading-6 text-muted-foreground">
                            {roleStage.sideDescription}
                          </p>
                        </div>
                      </div>

                      {stageBridgeTargets.length > 0 ? (
                        <div className="rounded-[1.1rem] border border-border/60 bg-background/75 px-[0.95rem] py-[0.9rem]">
                          <div className="flex items-center gap-[0.5rem]">
                            <Eye className="size-4" />
                            <div className="text-[0.72rem] uppercase tracking-[0.12em] text-muted-foreground">
                              See this through another desk
                            </div>
                          </div>

                          <div className="mt-[0.75rem] grid gap-[0.65rem] md:grid-cols-2">
                            {stageBridgeTargets.map((target) => {
                              const TargetIcon = getRoleIcon(target.targetRoleIconKey)

                              return (
                                <button
                                  key={`${target.bridge.targetRole}-${target.targetScenarioLabel}`}
                                  type="button"
                                  onClick={() =>
                                    onRoleJump?.(
                                      target.bridge.targetRole,
                                      target.bridge.targetScenario,
                                    )
                                  }
                                  className="rounded-[1rem] border border-border/60 bg-card/55 p-[0.85rem] text-left transition-colors hover:bg-card/75"
                                  data-testid={`preview-stage-bridge-${target.bridge.targetRole}`}
                                  aria-label={target.contextualTitle}
                                >
                                  <div className="flex items-start justify-between gap-[0.65rem]">
                                    <div className="flex items-start gap-[0.65rem]">
                                      <div className="rounded-[0.85rem] border border-border/60 bg-background/80 p-[0.55rem]">
                                        <TargetIcon className="size-4" />
                                      </div>

                                      <div>
                                        <div className="text-sm font-semibold tracking-tight">
                                          {target.contextualTitle}
                                        </div>
                                        <div className="mt-[0.25rem] flex flex-wrap items-center gap-[0.4rem]">
                                          <Badge variant="outline" className="rounded-full">
                                            {target.targetRoleLabel}
                                          </Badge>
                                          <Badge variant="outline" className="rounded-full">
                                            {target.targetScenarioLabel}
                                          </Badge>
                                        </div>
                                        <p className="mt-[0.45rem] text-xs leading-5 text-muted-foreground">
                                          {target.contextualDescription}
                                        </p>
                                        {target.bridge.teaser ? (
                                          <p className="mt-[0.35rem] text-xs leading-5 text-muted-foreground">
                                            {target.bridge.teaser}
                                          </p>
                                        ) : null}
                                      </div>
                                    </div>

                                    <ArrowRight className="mt-[0.1rem] size-4 shrink-0" />
                                  </div>
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      ) : null}

                      <div className="flex flex-col gap-[0.85rem] border-t border-border/70 pt-[0.9rem] md:flex-row md:items-center md:justify-between">
                        <div className="flex flex-wrap items-center gap-[0.875rem] text-sm text-muted-foreground">
                          <span>{featuredEvent.actor}</span>
                          <span>{featuredEvent.timestamp}</span>
                          {featuredEvent.sla ? <span>{featuredEvent.sla}</span> : null}
                        </div>

                        <div className="flex flex-wrap gap-[0.5rem]">
                          <Button size="sm">Inspect this step</Button>
                          <Button size="sm" variant="outline">
                            See who else cares
                          </Button>
                        </div>
                      </div>
                    </div>
                  </article>
                ) : null}

                <div className="grid gap-[0.85rem] xl:grid-cols-2">
                  {secondaryEvents.map((event) => (
                    <article
                      key={event.id}
                      className={`rounded-[1.45rem] border border-border/70 bg-card/55 shadow-sm ${compactClass.panel}`}
                    >
                      <div className="flex items-start justify-between gap-[0.75rem]">
                        <div>
                          {event.eyebrow ? (
                            <div className="text-[0.72rem] uppercase tracking-[0.12em] text-muted-foreground">
                              {event.eyebrow}
                            </div>
                          ) : null}
                          <h3 className="mt-[0.3rem] text-[1rem] font-semibold tracking-tight">
                            {event.title}
                          </h3>
                        </div>

                        {event.status ? (
                          <Badge variant="outline" className="rounded-full">
                            {titleCaseStatus(event.status)}
                          </Badge>
                        ) : null}
                      </div>

                      <p className="mt-[0.55rem] text-sm leading-6 text-muted-foreground">
                        {event.description}
                      </p>

                      <div className="mt-[0.8rem] flex flex-wrap gap-[0.5rem]">
                        {event.tags?.slice(0, 3).map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="rounded-full px-[0.65rem] py-[0.2rem]"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
                )}
              </motion.div>
            </AnimatePresence>
          </main>

          <aside className="border-t border-border/70 bg-background/72 p-[1rem] lg:border-t-[length:0] lg:border-l">
            <motion.div layout className="grid gap-[0.875rem]">
              <section className="rounded-[1.45rem] border border-border/70 bg-card/60 p-[1rem] shadow-sm">
                <div className="text-[0.72rem] uppercase tracking-[0.12em] text-muted-foreground">
                  {roleStage.sideTitle}
                </div>
                <div className="mt-[0.4rem] text-[1.05rem] font-semibold tracking-tight">
                  {roleStage.primaryQuestion}
                </div>
                <p className="mt-[0.45rem] text-sm leading-6 text-muted-foreground">
                  {roleStage.sideDescription}
                </p>
              </section>

              <section className="rounded-[1.45rem] border border-border/70 bg-card/60 p-[1rem] shadow-sm">
                <div className="flex items-center gap-[0.55rem]">
                  <ReceiptText className="size-4" />
                  <div className="text-[0.72rem] uppercase tracking-[0.12em] text-muted-foreground">
                    Same event, different eyes
                  </div>
                </div>

                <div className="mt-[0.8rem] space-y-[0.55rem]">
                  {scenarioStage.continuity.map((step, index) => (
                    <div
                      key={step}
                      className="flex items-center gap-[0.65rem] rounded-[1rem] border border-border/60 bg-background/75 px-[0.85rem] py-[0.7rem]"
                    >
                      <div className="rounded-full border border-border/60 bg-card/60 px-[0.5rem] py-[0.15rem] text-[0.72rem] font-semibold tracking-tight">
                        {index + 1}
                      </div>
                      <div className="text-sm font-medium tracking-tight">{step}</div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-[1.45rem] border border-border/70 bg-card/60 p-[1rem] shadow-sm">
                <div className="flex items-center gap-[0.55rem]">
                  {inspectState.stress === "degraded" ? (
                    <AlertTriangle className="size-4" />
                  ) : (
                    <CheckCircle2 className="size-4" />
                  )}
                  <div className="text-[0.72rem] uppercase tracking-[0.12em] text-muted-foreground">
                    {signalHeading.title}
                  </div>
                </div>

                <p className="mt-[0.4rem] text-xs leading-5 text-muted-foreground">
                  {signalHeading.description}
                </p>

                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={`${role}:${scenario}:signals`}
                    data-testid="preview-signal-stack"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={previewMotion.content}
                    className="mt-[0.8rem] space-y-[0.55rem]"
                  >
                    {visibleSignals.map((signal, index) => {
                      const isDegradedIngestion =
                        inspectState.stress === "degraded" &&
                        signal.id === "signal-ingestion"
                      return (
                      <div
                        key={signal.id}
                        className={
                          isDegradedIngestion
                            ? "rounded-[1rem] border border-[#f59e0b80] bg-[#f59e0b0f] px-[0.85rem] py-[0.75rem] ring-1 ring-[#f59e0b59]"
                            : index === 0
                              ? "rounded-[1rem] border border-border bg-background px-[0.85rem] py-[0.75rem]"
                              : "rounded-[1rem] border border-border/60 bg-background/75 px-[0.85rem] py-[0.75rem]"
                        }
                      >
                        <div className="flex items-start justify-between gap-[0.65rem]">
                          <div>
                            <div className="flex flex-wrap items-center gap-[0.45rem]">
                              <div className="text-sm font-semibold tracking-tight">
                                {signal.label}
                              </div>

                              {index === 0 ? (
                                <Badge variant="outline" className="rounded-full">
                                  highest relevance
                                </Badge>
                              ) : null}
                            </div>

                            {signal.description ? (
                              <p className="mt-[0.25rem] text-xs leading-5 text-muted-foreground">
                                {signal.description}
                              </p>
                            ) : null}
                          </div>

                          <Badge variant="outline" className="rounded-full">
                            {inspectState.stress === "degraded" && signal.id === "signal-ingestion"
                              ? "Degraded"
                              : titleCaseStatus(signal.status)}
                          </Badge>
                        </div>

                        {signal.value ? (
                          <div className="mt-[0.4rem] text-[0.78rem] uppercase tracking-[0.11em] text-muted-foreground">
                            {signal.value}
                          </div>
                        ) : null}
                      </div>
                    )
                  })}
                  </motion.div>
                </AnimatePresence>
              </section>

              <section data-testid="preview-insight-stack" className="grid gap-[0.75rem]">
                <div className="rounded-[1.2rem] border border-border/60 bg-background/75 px-[0.9rem] py-[0.8rem]">
                  <div className="text-[0.72rem] uppercase tracking-[0.12em] text-muted-foreground">
                    {insightRailHeading.title}
                  </div>
                  <p className="mt-[0.35rem] text-xs leading-5 text-muted-foreground">
                    {insightRailHeading.description}
                  </p>
                </div>

                {visibleInsights.map((insight, index) => (
                  <article
                    key={insight.id}
                    className={`rounded-[1.45rem] border border-border/70 bg-card/60 shadow-sm ${compactClass.panel}`}
                  >
                    <div className="flex items-start justify-between gap-[0.65rem]">
                      <div>
                        {insight.eyebrow ? (
                          <div className="text-[0.72rem] uppercase tracking-[0.12em] text-muted-foreground">
                            {insight.eyebrow}
                          </div>
                        ) : null}

                        <h3 className="mt-[0.35rem] text-[1rem] font-semibold tracking-tight">
                          {insight.title}
                        </h3>
                      </div>

                      {index === 0 ? (
                        <Badge variant="outline" className="rounded-full">
                          highest relevance
                        </Badge>
                      ) : null}
                    </div>

                    <p className={`mt-[0.45rem] leading-6 text-muted-foreground ${compactClass.text}`}>
                      {insight.description}
                    </p>

                    <div className="mt-[0.7rem] flex items-center justify-between gap-[0.65rem]">
                      <div className="text-xs uppercase tracking-[0.11em] text-muted-foreground">
                        {insight.meta}
                      </div>
                      {insight.value ? (
                        <div className="text-sm font-medium tracking-tight">
                          {insight.value}
                        </div>
                      ) : null}
                    </div>
                  </article>
                ))}
              </section>

              <section className="rounded-[1.45rem] border border-border/70 bg-card/65 p-[1rem] shadow-sm">
                <div className="text-[0.72rem] uppercase tracking-[0.12em] text-muted-foreground">
                  Perspective bridge
                </div>
                <div className="mt-[0.35rem] text-[1.1rem] font-semibold tracking-tight">
                  {perspectiveBridge.title}
                </div>
                <p className="mt-[0.45rem] text-sm leading-6 text-muted-foreground">
                  {perspectiveBridge.description}
                </p>
                <div className="mt-[0.75rem]">
                  <Button variant="ghost" size="sm">
                    {perspectiveBridge.actionLabel}
                    <ArrowRight className="ml-[0.35rem] size-4" />
                  </Button>
                </div>
              </section>
            </motion.div>
          </aside>
        </div>
      </div>
    </section>
  )
}
