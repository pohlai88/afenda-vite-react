/**
 * USE PLATFORM PREVIEW STATE
 *
 * Central interaction state for the AFENDA role-play showcase.
 * Keeps orchestration out of the page component so rendering stays thin.
 */

import { useMemo, useState } from "react"

import { platformPreviewFixture } from "../data/platform-preview-fixtures"
import {
  getPreviewRoleCard,
  getPreviewScenarioDefinition,
} from "../data/platform-preview-role-play"
import {
  getRoleClosingContent,
  getRoleFooterStripContent,
  getRoleIntroContent,
} from "../content/platform-preview-role-content"
import type {
  PreviewInspectState,
  PreviewRole,
  PreviewRoleBridge,
  PreviewScenario,
} from "../types/platform-preview-types"

export type PlatformPreviewBridgeTarget = {
  readonly bridge: PreviewRoleBridge
  readonly targetRoleCard: ReturnType<typeof getPreviewRoleCard>
  readonly targetScenarioDef: ReturnType<typeof getPreviewScenarioDefinition>
}

export function usePlatformPreviewState() {
  const [activeRole, setActiveRole] = useState<PreviewRole>("controller")
  const [activeScenario, setActiveScenario] =
    useState<PreviewScenario>("payment-release")
  const [inspectState, setInspectState] = useState<PreviewInspectState>({
    mode: "preview",
    theme: "light",
    density: platformPreviewFixture.density,
    stress: "default",
  })
  const [inspectOpen, setInspectOpen] = useState(false)

  const role = useMemo(() => getPreviewRoleCard(activeRole), [activeRole])
  const scenario = useMemo(
    () => getPreviewScenarioDefinition(activeScenario),
    [activeScenario],
  )

  const roleIntro = useMemo(() => getRoleIntroContent(activeRole), [activeRole])
  const roleClosing = useMemo(
    () => getRoleClosingContent(activeRole),
    [activeRole],
  )
  const roleFooterStrip = useMemo(
    () => getRoleFooterStripContent(activeRole),
    [activeRole],
  )

  const bridgeTargets = useMemo<ReadonlyArray<PlatformPreviewBridgeTarget>>(() => {
    const bridges = [role.bridgeUp, role.bridgeDown].filter(
      (value): value is PreviewRoleBridge => Boolean(value),
    )

    return bridges.map((bridge) => ({
      bridge,
      targetRoleCard: getPreviewRoleCard(bridge.targetRole),
      targetScenarioDef: getPreviewScenarioDefinition(
        bridge.targetScenario ?? activeScenario,
      ),
    }))
  }, [activeScenario, role])

  const jumpToBridge = (bridge: PreviewRoleBridge) => {
    setActiveRole(bridge.targetRole)

    if (bridge.targetScenario) {
      setActiveScenario(bridge.targetScenario)
    }
  }

  const jumpToRoleAndScenario = (
    targetRole: PreviewRole,
    targetScenario?: PreviewScenario,
  ) => {
    setActiveRole(targetRole)

    if (targetScenario) {
      setActiveScenario(targetScenario)
    }
  }

  return {
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
  }
}
