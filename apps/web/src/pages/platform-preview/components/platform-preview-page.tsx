/**
 * PLATFORM PREVIEW PAGE
 *
 * Role-play showcase for AFENDA.
 * This page is intentionally dual-purpose:
 * - public-facing product preview
 * - internal visual / UX supervision surface
 *
 * Core idea:
 * - visitors enter through a role
 * - explore a shared business scenario
 * - peek into what adjacent roles see
 * - optionally open inspect controls for QA / regression review
 */

import { AnimatePresence, motion } from "framer-motion"
import {
  ArrowRight,
  Eye,
  LaptopMinimal,
  ReceiptText,
  ShieldCheck,
} from "lucide-react"

import { Badge, Button } from "@afenda/design-system/ui-primitives"

import {
  getPreviewRoleCard,
  getPreviewScenarioDefinition,
  previewRoleCards,
  previewScenarioDefinitions,
} from "../data/platform-preview-role-play"
import {
  getScenarioContinuityPreview,
  getScenarioRoleTeaser,
} from "../content/platform-preview-role-content"
import { previewMotion } from "../config/platform-preview-motion"
import { usePlatformPreviewState } from "../hooks/use-platform-preview-state"
import { getRoleIcon, getScenarioIcon } from "../utils/platform-preview-icons"
import type { PreviewRoleBridge } from "../types/platform-preview-types"
import { ShowcaseShellPreview } from "./showcase-shell-preview"

type RoleCardPreviewTarget = {
  readonly direction: "up" | "down"
  readonly label: string
  readonly bridge: PreviewRoleBridge
  readonly targetRoleLabel: string
  readonly targetScenarioLabel?: string
}

function getRoleCardPreviewTargets(
  role: ReturnType<typeof getPreviewRoleCard>,
): ReadonlyArray<RoleCardPreviewTarget> {
  const targets: RoleCardPreviewTarget[] = []

  if (role.bridgeUp) {
    const targetRole = getPreviewRoleCard(role.bridgeUp.targetRole)
    const targetScenario = role.bridgeUp.targetScenario
      ? getPreviewScenarioDefinition(role.bridgeUp.targetScenario)
      : null

    targets.push({
      direction: "up",
      label: role.bridgeUp.label,
      bridge: role.bridgeUp,
      targetRoleLabel: targetRole.shortLabel,
      targetScenarioLabel: targetScenario?.label,
    })
  }

  if (role.bridgeDown) {
    const targetRole = getPreviewRoleCard(role.bridgeDown.targetRole)
    const targetScenario = role.bridgeDown.targetScenario
      ? getPreviewScenarioDefinition(role.bridgeDown.targetScenario)
      : null

    targets.push({
      direction: "down",
      label: role.bridgeDown.label,
      bridge: role.bridgeDown,
      targetRoleLabel: targetRole.shortLabel,
      targetScenarioLabel: targetScenario?.label,
    })
  }

  return targets
}

export function PlatformPreviewPage() {
  const {
    activeRole,
    activeScenario,
    inspectState,
    inspectOpen,
    role,
    scenario,
    roleIntro,
    roleClosing,
    roleFooterStrip,
    bridgeTargets,
    setActiveRole,
    setActiveScenario,
    setInspectState,
    setInspectOpen,
    jumpToBridge,
    jumpToRoleAndScenario,
  } = usePlatformPreviewState()

  return (
    <main
      id="platform-preview-page"
      data-page="platform-preview"
      data-role={activeRole}
      data-scenario={activeScenario}
      className="min-h-screen bg-background text-foreground"
    >
      <div aria-live="polite" className="sr-only">
        {`Viewing ${role.label} in ${scenario.label}`}
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-[1rem] px-6 py-[1.25rem] md:px-8 lg:px-10">
        <section className="rounded-[1.75rem] border border-border/60 bg-card/45 p-[1rem] shadow-sm md:p-[1.25rem]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`intro:${activeRole}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={previewMotion.content}
              className="grid gap-[1rem] xl:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)] xl:items-start"
            >
              <div className="max-w-4xl">
                <div className="flex flex-wrap items-center gap-[0.625rem]">
                  <span className="inline-flex items-center rounded-full border border-border/70 bg-background/80 px-[0.85rem] py-[0.45rem] text-[0.72rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    AFENDA role-play showcase
                  </span>
                  <Badge variant="outline" className="rounded-full px-[0.75rem] py-[0.2rem]">
                    {roleIntro.eyebrow}
                  </Badge>
                  <Badge variant="outline" className="rounded-full px-[0.75rem] py-[0.2rem]">
                    same truth, different eyes
                  </Badge>
                  <Badge variant="outline" className="rounded-full px-[0.75rem] py-[0.2rem]">
                    preview + supervision
                  </Badge>
                </div>

                <h1 className="mt-[0.875rem] text-[2rem] font-semibold leading-[1.02] tracking-[-0.03em] md:text-[3rem]">
                  {roleIntro.title}
                </h1>

                <p className="mt-[0.75rem] max-w-3xl text-sm leading-6 text-muted-foreground md:text-base md:leading-7">
                  {roleIntro.description}
                </p>

                <div className="mt-[0.95rem] rounded-[1.1rem] border border-border/60 bg-background/75 px-[0.9rem] py-[0.8rem]">
                  <div className="text-[0.68rem] uppercase tracking-[0.11em] text-muted-foreground">
                    {roleIntro.curiosityLabel}
                  </div>
                  <p className="mt-[0.35rem] text-sm leading-6 text-muted-foreground">
                    {roleIntro.curiosityText}
                  </p>
                </div>
              </div>

              <div className="grid gap-[0.75rem]">
                <div className="rounded-[1rem] border border-border/60 bg-background/75 px-[0.9rem] py-[0.8rem]">
                  <div className="text-[0.72rem] uppercase tracking-[0.12em] text-muted-foreground">
                    {roleIntro.quickLabel}
                  </div>

                  <div className="mt-[0.55rem] grid gap-[0.45rem]">
                    {roleIntro.quickPoints.map((point) => (
                      <div
                        key={point}
                        className="rounded-[0.85rem] border border-border/60 bg-card/55 px-[0.75rem] py-[0.65rem] text-[0.8rem] font-medium tracking-tight"
                      >
                        {point}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-[0.5rem] sm:grid-cols-2 xl:grid-cols-1">
                  <div className="rounded-[1rem] border border-border/60 bg-background/75 px-[0.9rem] py-[0.8rem]">
                    <div className="text-[0.72rem] uppercase tracking-[0.12em] text-muted-foreground">
                      Fast visitor path
                    </div>
                    <div className="mt-[0.3rem] text-sm font-medium tracking-tight">
                      Pick a role. Choose a scenario. Jump across desks.
                    </div>
                  </div>

                  <div className="rounded-[1rem] border border-border/60 bg-background/75 px-[0.9rem] py-[0.8rem]">
                    <div className="text-[0.72rem] uppercase tracking-[0.12em] text-muted-foreground">
                      Internal supervision
                    </div>
                    <div className="mt-[0.3rem] text-sm font-medium tracking-tight">
                      Open inspect mode to pressure-test density, state, and perspective shifts.
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </section>

        <section className="grid gap-[0.875rem] md:grid-cols-2 xl:grid-cols-5">
          {previewRoleCards.map((item) => {
            const Icon = getRoleIcon(item.iconKey)
            const isActive = item.id === activeRole
            const previewTargets = getRoleCardPreviewTargets(item)

            return (
              <motion.article
                key={item.id}
                layout
                transition={{
                  layout: previewMotion.layout,
                  default: previewMotion.content,
                }}
                className={
                  isActive
                    ? "rounded-[1.5rem] border border-border bg-card p-[1rem] shadow-sm xl:col-span-2"
                    : "rounded-[1.5rem] border border-border/60 bg-card/45 p-[1rem] shadow-sm xl:col-span-1"
                }
              >
                <button
                  type="button"
                  onClick={() => setActiveRole(item.id)}
                  className="w-full text-left"
                  data-testid={`preview-role-card-${item.id}`}
                  aria-label={`Switch to ${item.label} view`}
                  aria-pressed={isActive}
                >
                  <div className="flex items-start justify-between gap-[0.75rem]">
                    <motion.div
                      layout="position"
                      className="rounded-[1rem] border border-border/60 bg-background/80 p-[0.7rem]"
                    >
                      <Icon className="size-4" />
                    </motion.div>

                    <motion.div
                      layout="position"
                      className="flex flex-wrap items-center justify-end gap-[0.4rem]"
                    >
                      {isActive ? (
                        <Badge variant="outline" className="rounded-full">
                          current lens
                        </Badge>
                      ) : null}

                      {previewTargets.length > 0 ? (
                        <Badge variant="outline" className="rounded-full">
                          role-play
                        </Badge>
                      ) : null}
                    </motion.div>
                  </div>

                  <motion.div
                    layout
                    className={
                      isActive
                        ? "mt-[0.875rem] grid gap-[1rem] xl:grid-cols-[minmax(0,1.1fr)_minmax(14rem,0.9fr)]"
                        : "mt-[0.875rem] grid gap-[0.75rem]"
                    }
                  >
                    <div>
                      <div className="text-[1rem] font-semibold tracking-tight">{item.label}</div>

                      <p className="mt-[0.35rem] text-sm leading-6 text-muted-foreground">
                        {item.summary}
                      </p>

                      <div className="mt-[0.75rem] text-[0.8rem] leading-5 text-muted-foreground">
                        {item.hook}
                      </div>
                    </div>

                    {isActive ? (
                      <motion.div
                        layout
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={previewMotion.content}
                        className="rounded-[1rem] border border-border/60 bg-background/75 p-[0.95rem]"
                      >
                        <div className="text-[0.7rem] uppercase tracking-[0.12em] text-muted-foreground">
                          Current role unlocks
                        </div>

                        <div className="mt-[0.55rem] grid gap-[0.45rem]">
                          {item.whatYouSee.slice(0, 3).map((point) => (
                            <motion.div
                              key={point}
                              layout="position"
                              className="rounded-[0.85rem] border border-border/60 bg-card/55 px-[0.7rem] py-[0.6rem] text-[0.78rem] font-medium tracking-tight"
                            >
                              {point}
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    ) : null}
                  </motion.div>
                </button>

                {previewTargets.length > 0 ? (
                  <motion.div
                    layout
                    className="mt-[0.95rem] rounded-[1rem] border border-border/60 bg-background/75 p-[0.8rem]"
                  >
                    <div className="text-[0.7rem] uppercase tracking-[0.12em] text-muted-foreground">
                      Peek next
                    </div>

                    <motion.div
                      layout
                      className={
                        isActive
                          ? "mt-[0.55rem] grid gap-[0.5rem] md:grid-cols-2"
                          : "mt-[0.55rem] grid gap-[0.5rem]"
                      }
                    >
                      {previewTargets.map((target) => (
                        <button
                          key={`${item.id}-${target.direction}-${target.targetRoleLabel}`}
                          type="button"
                          onClick={() => jumpToBridge(target.bridge)}
                          className="rounded-[0.9rem] border border-border/60 bg-card/55 px-[0.75rem] py-[0.65rem] text-left transition-colors hover:bg-card/75"
                          data-testid={`preview-role-peek-${item.id}-${target.bridge.targetRole}`}
                          aria-label={`Jump to ${target.targetRoleLabel} in ${target.targetScenarioLabel ?? "current scenario"}`}
                        >
                          <div className="flex items-center justify-between gap-[0.5rem]">
                            <div className="text-[0.8rem] font-semibold tracking-tight">
                              {target.targetRoleLabel}
                            </div>
                            <div className="flex items-center gap-[0.35rem] text-[0.68rem] uppercase tracking-[0.11em] text-muted-foreground">
                              <span>{target.direction === "up" ? "above you" : "below you"}</span>
                              <ArrowRight className="size-3.5" />
                            </div>
                          </div>

                          {target.targetScenarioLabel ? (
                            <div className="mt-[0.25rem] text-[0.72rem] uppercase tracking-[0.11em] text-muted-foreground">
                              {target.targetScenarioLabel}
                            </div>
                          ) : null}

                          <p className="mt-[0.35rem] text-[0.75rem] leading-5 text-muted-foreground">
                            {target.label}
                          </p>
                        </button>
                      ))}
                    </motion.div>
                  </motion.div>
                ) : null}
              </motion.article>
            )
          })}
        </section>

        <section className="rounded-[1.75rem] border border-border/60 bg-card/40 p-[1rem] shadow-sm md:p-[1.25rem]">
          <div className="grid gap-[1rem] xl:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
            <div>
              <div className="flex flex-wrap items-center gap-[0.625rem]">
                <Badge variant="outline" className="rounded-full px-[0.75rem] py-[0.2rem]">
                  {role.shortLabel} lens
                </Badge>
                <Badge variant="outline" className="rounded-full px-[0.75rem] py-[0.2rem]">
                  {scenario.label}
                </Badge>
                <Badge variant="outline" className="rounded-full px-[0.75rem] py-[0.2rem]">
                  {inspectState.mode}
                </Badge>
              </div>

              <h2 className="mt-[0.875rem] text-[1.65rem] font-semibold tracking-tight md:text-[2.15rem]">
                {role.question}
              </h2>

              <p className="mt-[0.65rem] max-w-3xl text-sm leading-6 text-muted-foreground md:text-base md:leading-7">
                {scenario.summary}
              </p>

              <div className="mt-[1rem] grid gap-[0.75rem] lg:grid-cols-2">
                {previewScenarioDefinitions.map((item) => {
                  const ScenarioIcon = getScenarioIcon(item.id)
                  const isActive = item.id === activeScenario
                  const teaser = getScenarioRoleTeaser(activeRole, item.id)
                  const continuityPreview = getScenarioContinuityPreview(
                    activeRole,
                    item.id,
                    item.continuity,
                  )

                  return (
                    <motion.button
                      key={item.id}
                      layout
                      type="button"
                      onClick={() => setActiveScenario(item.id)}
                      whileTap={{ scale: 0.995 }}
                      transition={{
                        layout: {
                          duration: 0.22,
                          ease: [0.22, 1, 0.36, 1],
                        },
                      }}
                      className={
                        isActive
                          ? "rounded-[1.15rem] border border-border bg-card p-[0.95rem] text-left shadow-sm"
                          : "rounded-[1.15rem] border border-border/60 bg-background/75 p-[0.95rem] text-left shadow-sm transition-colors hover:bg-background"
                      }
                      data-testid={`preview-scenario-card-${item.id}`}
                      aria-label={`Switch scenario to ${item.label}`}
                      aria-pressed={isActive}
                    >
                      <div className="flex items-start justify-between gap-[0.75rem]">
                        <div className="flex items-start gap-[0.75rem]">
                          <div className="rounded-[0.9rem] border border-border/60 bg-card/55 p-[0.6rem]">
                            <ScenarioIcon className="size-4" />
                          </div>

                          <div>
                            <div className="text-sm font-semibold tracking-tight">{item.label}</div>
                            <p className="mt-[0.3rem] text-[0.8rem] leading-5 text-muted-foreground">
                              {item.summary}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-[0.35rem]">
                          <AnimatePresence mode="wait" initial={false}>
                            <motion.div
                              key={`${item.id}:${activeRole}:role-badge`}
                              initial={{ opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -4 }}
                              transition={previewMotion.contentQuick}
                            >
                              <Badge variant="outline" className="rounded-full">
                                for {role.shortLabel.toLowerCase()}
                              </Badge>
                            </motion.div>
                          </AnimatePresence>

                          {isActive ? (
                            <Badge variant="outline" className="rounded-full">
                              current story
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="rounded-full">
                              switch
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="mt-[0.75rem] rounded-[0.95rem] border border-border/60 bg-card/50 px-[0.8rem] py-[0.7rem]">
                        <AnimatePresence mode="wait" initial={false}>
                          <motion.div
                            key={`${item.id}:${activeRole}:teaser`}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={previewMotion.content}
                          >
                            <div className="text-[0.68rem] uppercase tracking-[0.11em] text-muted-foreground">
                              Why this matters to {role.shortLabel.toLowerCase()}
                            </div>
                            <p className="mt-[0.35rem] text-[0.78rem] leading-5 text-muted-foreground">
                              {teaser}
                            </p>
                          </motion.div>
                        </AnimatePresence>
                      </div>

                      <div className="mt-[0.8rem]">
                        <div className="mb-[0.35rem] text-[0.68rem] uppercase tracking-[0.11em] text-muted-foreground">
                          Continuity focus for {role.shortLabel.toLowerCase()}
                        </div>

                        <AnimatePresence mode="wait" initial={false}>
                          <motion.div
                            key={`${item.id}:${activeRole}:continuity`}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={previewMotion.content}
                            className="flex flex-wrap gap-[0.4rem]"
                          >
                            {continuityPreview.map((step, index) => (
                              <div
                                key={step}
                                className={
                                  index === 0
                                    ? "rounded-full border border-border bg-card px-[0.65rem] py-[0.35rem] text-[0.72rem] font-semibold tracking-tight"
                                    : "rounded-full border border-border/60 bg-card/50 px-[0.65rem] py-[0.35rem] text-[0.72rem] font-medium tracking-tight text-muted-foreground"
                                }
                              >
                                {step}
                              </div>
                            ))}
                          </motion.div>
                        </AnimatePresence>
                      </div>
                    </motion.button>
                  )
                })}
              </div>

              <div className="mt-[1rem] grid gap-[0.625rem] md:grid-cols-2">
                {role.whatYouSee.map((point) => (
                  <div
                    key={point}
                    className="rounded-[1rem] border border-border/60 bg-background/75 px-[0.95rem] py-[0.85rem]"
                  >
                    <div className="text-sm font-medium tracking-tight">{point}</div>
                  </div>
                ))}
              </div>
            </div>

            <aside className="grid gap-[0.75rem]">
              <div className="rounded-[1.5rem] border border-border/60 bg-background/75 p-[1rem]">
                <div className="text-[0.72rem] uppercase tracking-[0.12em] text-muted-foreground">
                  Role curiosity
                </div>
                <div className="mt-[0.35rem] text-[1.1rem] font-semibold tracking-tight">
                  People want their view — and a believable read of everyone else’s.
                </div>
                <p className="mt-[0.35rem] text-sm leading-6 text-muted-foreground">
                  One event moves up and down the chain so comparisons stay fair.
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-border/60 bg-background/75 p-[1rem]">
                <div className="text-[0.72rem] uppercase tracking-[0.12em] text-muted-foreground">
                  Same event, different eyes
                </div>
                <div className="mt-[0.75rem] flex flex-wrap gap-[0.5rem]">
                  {scenario.continuity.map((step) => (
                    <div
                      key={step}
                      className="rounded-full border border-border/60 bg-card/55 px-[0.75rem] py-[0.45rem] text-[0.78rem] font-medium tracking-tight"
                    >
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section className="grid gap-[1rem] xl:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
          <div className="rounded-[1.75rem] border border-border/60 bg-card/35 p-[0.75rem] shadow-sm">
            <div className="mb-[0.75rem] flex items-center justify-between gap-[0.75rem] px-[0.35rem]">
              <div>
                <div className="text-[0.72rem] uppercase tracking-[0.12em] text-muted-foreground">
                  Live role stage
                </div>
                <div className="mt-[0.2rem] text-[1rem] font-semibold tracking-tight">
                  Viewing as {role.label}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-[0.5rem]">
                <Badge variant="outline" className="rounded-full">
                  {inspectState.theme}
                </Badge>
                <Badge variant="outline" className="rounded-full">
                  {inspectState.density}
                </Badge>
                <Badge variant="outline" className="rounded-full">
                  {inspectState.stress}
                </Badge>
              </div>
            </div>

            <ShowcaseShellPreview
              role={activeRole}
              scenario={activeScenario}
              inspectState={inspectState}
              onRoleJump={jumpToRoleAndScenario}
            />
          </div>

          <aside className="grid gap-[0.875rem]">
            <section className="rounded-[1.75rem] border border-border/60 bg-card/45 p-[1rem] shadow-sm">
              <div className="text-[0.72rem] uppercase tracking-[0.12em] text-muted-foreground">
                What this role cares about
              </div>
              <div className="mt-[0.4rem] text-[1.2rem] font-semibold tracking-tight">
                {role.summary}
              </div>
              <p className="mt-[0.55rem] text-sm leading-6 text-muted-foreground">
                {role.hook}
              </p>
            </section>

            <section className="rounded-[1.75rem] border border-border/60 bg-card/45 p-[1rem] shadow-sm">
              <div className="flex items-center gap-[0.5rem]">
                <Eye className="size-4" />
                <div className="text-[0.72rem] uppercase tracking-[0.12em] text-muted-foreground">
                  Curious what others see?
                </div>
              </div>

              <div className="mt-[0.875rem] grid gap-[0.75rem]">
                {bridgeTargets.map(({ bridge, targetRoleCard, targetScenarioDef }) => {
                  const TargetIcon = getRoleIcon(targetRoleCard.iconKey)

                  return (
                    <button
                      key={`${targetRoleCard.id}-${targetScenarioDef.id}`}
                      type="button"
                      data-testid={`preview-bridge-aside-${bridge.targetRole}`}
                      aria-label={`Jump to ${targetRoleCard.label} in ${targetScenarioDef.label}`}
                      onClick={() => jumpToBridge(bridge)}
                      className="rounded-[1.25rem] border border-border bg-background/75 p-[0.95rem] text-left transition-colors hover:bg-background"
                    >
                      <div className="flex items-start justify-between gap-[0.75rem]">
                        <div className="flex items-start gap-[0.75rem]">
                          <div className="rounded-[0.9rem] border border-border/60 bg-card/60 p-[0.6rem]">
                            <TargetIcon className="size-4" />
                          </div>

                          <div>
                            <div className="text-sm font-semibold tracking-tight">
                              {targetRoleCard.label}
                            </div>
                            <p className="mt-[0.3rem] text-xs leading-5 text-muted-foreground">
                              {bridge.label}
                            </p>

                            <div className="mt-[0.5rem] flex flex-wrap items-center gap-[0.45rem]">
                              <Badge variant="outline" className="rounded-full">
                                {targetScenarioDef.label}
                              </Badge>
                              <span className="text-[0.72rem] uppercase tracking-[0.11em] text-muted-foreground">
                                switch role + scenario
                              </span>
                            </div>

                            {bridge.teaser ? (
                              <p className="mt-[0.5rem] text-xs leading-5 text-muted-foreground">
                                {bridge.teaser}
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
            </section>

            <section className="rounded-[1.75rem] border border-border/60 bg-card/45 p-[1rem] shadow-sm">
              <div className="text-[0.72rem] uppercase tracking-[0.12em] text-muted-foreground">
                Shared truth
              </div>
              <div className="mt-[0.35rem] text-[1.05rem] font-semibold tracking-tight">
                Different roles do not need different realities.
              </div>
              <p className="mt-[0.35rem] text-sm leading-6 text-muted-foreground">
                Same movement, evidence path, and control posture — different surfaces.
              </p>
            </section>
          </aside>
        </section>

        <section className="rounded-[1.75rem] border border-border/60 bg-card/40 p-[1rem] shadow-sm md:p-[1.25rem]">
          <div className="flex flex-col gap-[1rem] lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <div className="text-[0.72rem] uppercase tracking-[0.12em] text-muted-foreground">
                Inspect dock
              </div>
              <div className="mt-[0.35rem] text-[1.25rem] font-semibold tracking-tight">
                Stress the surface when you need QA, not when visitors are watching.
              </div>
              <p className="mt-[0.35rem] text-sm leading-6 text-muted-foreground">
                Preview stays clean; inspect adds density, theme, and state controls for regression review.
              </p>
            </div>

            <Button
              type="button"
              variant={inspectOpen ? "default" : "outline"}
              onClick={() => setInspectOpen((value) => !value)}
              data-testid="preview-inspect-toggle"
              aria-expanded={inspectOpen}
              aria-controls="preview-inspect-panel"
              aria-label={
                inspectOpen ? "Hide inspect controls" : "Open inspect controls"
              }
            >
              {inspectOpen ? "Hide inspect controls" : "Open inspect controls"}
            </Button>
          </div>

          {inspectOpen ? (
            <div
              id="preview-inspect-panel"
              className="mt-[0.75rem] grid gap-[0.75rem] xl:grid-cols-4"
            >
              <div className="rounded-[1rem] border border-border/60 bg-background/75 p-[0.9rem]">
                <div className="mb-[0.55rem] text-[0.72rem] uppercase tracking-[0.12em] text-muted-foreground">
                  Mode
                </div>
                <div className="flex flex-wrap gap-[0.5rem]">
                  {(["preview", "inspect"] as const).map((mode) => (
                    <Button
                      key={mode}
                      type="button"
                      size="sm"
                      variant={inspectState.mode === mode ? "default" : "outline"}
                      onClick={() =>
                        setInspectState((current) => ({ ...current, mode }))
                      }
                      data-testid={`preview-inspect-mode-${mode}`}
                      aria-pressed={inspectState.mode === mode}
                    >
                      {mode}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="rounded-[1rem] border border-border/60 bg-background/75 p-[0.9rem]">
                <div className="mb-[0.55rem] text-[0.72rem] uppercase tracking-[0.12em] text-muted-foreground">
                  Theme
                </div>
                <div className="flex flex-wrap gap-[0.5rem]">
                  {(["light", "dark"] as const).map((theme) => (
                    <Button
                      key={theme}
                      type="button"
                      size="sm"
                      variant={inspectState.theme === theme ? "default" : "outline"}
                      onClick={() =>
                        setInspectState((current) => ({ ...current, theme }))
                      }
                      data-testid={`preview-inspect-theme-${theme}`}
                      aria-pressed={inspectState.theme === theme}
                    >
                      {theme}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="rounded-[1rem] border border-border/60 bg-background/75 p-[0.9rem]">
                <div className="mb-[0.55rem] text-[0.72rem] uppercase tracking-[0.12em] text-muted-foreground">
                  Density
                </div>
                <div className="flex flex-wrap gap-[0.5rem]">
                  {(["comfortable", "compact"] as const).map((density) => (
                    <Button
                      key={density}
                      type="button"
                      size="sm"
                      variant={inspectState.density === density ? "default" : "outline"}
                      onClick={() =>
                        setInspectState((current) => ({ ...current, density }))
                      }
                      data-testid={`preview-inspect-density-${density}`}
                      aria-pressed={inspectState.density === density}
                    >
                      {density}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="rounded-[1rem] border border-border/60 bg-background/75 p-[0.9rem]">
                <div className="mb-[0.55rem] text-[0.72rem] uppercase tracking-[0.12em] text-muted-foreground">
                  Stress state
                </div>
                <div className="flex flex-wrap gap-[0.5rem]">
                  {(["default", "empty", "degraded"] as const).map((stress) => (
                    <Button
                      key={stress}
                      type="button"
                      size="sm"
                      variant={inspectState.stress === stress ? "default" : "outline"}
                      onClick={() =>
                        setInspectState((current) => ({ ...current, stress }))
                      }
                      data-testid={`preview-inspect-stress-${stress}`}
                      aria-pressed={inspectState.stress === stress}
                    >
                      {stress}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </section>

        <section className="rounded-[1.75rem] border border-border/60 bg-card/45 p-[1rem] shadow-sm md:p-[1.25rem]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`closing:${activeRole}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={previewMotion.content}
              className="grid gap-[1rem] xl:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)] xl:items-center"
            >
              <div>
                <div className="text-[0.72rem] uppercase tracking-[0.12em] text-muted-foreground">
                  {roleClosing.eyebrow}
                </div>
                <div className="mt-[0.45rem] text-[1.5rem] font-semibold tracking-tight md:text-[1.85rem]">
                  {roleClosing.title}
                </div>
                <p className="mt-[0.65rem] max-w-3xl text-sm leading-6 text-muted-foreground">
                  {roleClosing.description}
                </p>

                <div className="mt-[0.9rem] rounded-[1rem] border border-border/60 bg-background/75 px-[0.9rem] py-[0.8rem]">
                  <div className="text-[0.68rem] uppercase tracking-[0.11em] text-muted-foreground">
                    Final prompt
                  </div>
                  <p className="mt-[0.35rem] text-sm leading-6 text-muted-foreground">
                    {roleClosing.finalPrompt}
                  </p>
                </div>
              </div>

              <div className="grid gap-[0.75rem]">
                <div className="flex flex-wrap gap-[0.75rem]">
                  <Button size="lg">{roleClosing.primaryActionLabel}</Button>
                  <Button size="lg" variant="outline">
                    {roleClosing.secondaryActionLabel}
                  </Button>
                </div>

                <div className="rounded-[1rem] border border-border/60 bg-background/75 px-[0.9rem] py-[0.8rem]">
                  <div className="text-[0.72rem] uppercase tracking-[0.12em] text-muted-foreground">
                    Why end here
                  </div>
                  <p className="mt-[0.35rem] text-sm leading-6 text-muted-foreground">
                    The point is not only to admire one screen. It is to understand how the same
                    truth survives across the whole chain of responsibility.
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </section>

        <section className="rounded-[1.5rem] border border-border/60 bg-card/40 p-[0.85rem] shadow-sm">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`footer-strip:${activeRole}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={previewMotion.content}
              className="grid gap-[0.75rem] md:grid-cols-3"
            >
              {roleFooterStrip.map((item, index) => {
                const Icon =
                  index === 0
                    ? LaptopMinimal
                    : index === 1
                      ? ReceiptText
                      : ShieldCheck

                return (
                  <div
                    key={item.id}
                    className={
                      index === 0
                        ? "rounded-[1.25rem] border border-border bg-card p-[1rem] shadow-sm"
                        : "rounded-[1.25rem] border border-border/60 bg-card/40 p-[1rem] shadow-sm"
                    }
                  >
                    <Icon className="size-4" />

                    <div className="mt-[0.55rem] text-sm font-semibold tracking-tight">
                      {item.title}
                    </div>

                    <p className="mt-[0.35rem] text-xs leading-5 text-muted-foreground">
                      {item.description}
                    </p>

                    {index === 0 ? (
                      <div className="mt-[0.6rem]">
                        <Badge variant="outline" className="rounded-full">
                          highest relevance for {role.shortLabel.toLowerCase()}
                        </Badge>
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </motion.div>
          </AnimatePresence>
        </section>
      </div>
    </main>
  )
}
