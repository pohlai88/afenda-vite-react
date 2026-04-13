import { useEffect, useMemo, useState } from "react"

import {
  executeFeatureTemplateCommand,
  featureTemplateCommands,
} from "../actions/feature-template-actions"
import { fetchFeatureTemplate } from "../services/feature-template-service"
import type {
  FeatureTemplateCommandId,
  FeatureTemplateCommandResult,
  FeatureTemplateDefinition,
} from "../types/feature-template"
import { resolveFeatureTemplateSlug } from "../utils/feature-template-utils"

export interface UseFeatureTemplateResult {
  readonly feature: FeatureTemplateDefinition | null
  readonly isLoading: boolean
  readonly actionResult: FeatureTemplateCommandResult | null
  readonly commands: typeof featureTemplateCommands
  readonly runCommand: (commandId: FeatureTemplateCommandId) => void
}

export function useFeatureTemplate(
  routeSlug: string | undefined
): UseFeatureTemplateResult {
  const slug = useMemo(() => resolveFeatureTemplateSlug(routeSlug), [routeSlug])
  const [feature, setFeature] = useState<FeatureTemplateDefinition | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [actionResult, setActionResult] =
    useState<FeatureTemplateCommandResult | null>(null)

  useEffect(() => {
    let isActive = true

    setIsLoading(true)
    void fetchFeatureTemplate(slug).then((nextFeature) => {
      if (!isActive) {
        return
      }

      setFeature(nextFeature)
      setActionResult(null)
      setIsLoading(false)
    })

    return () => {
      isActive = false
    }
  }, [slug])

  function runCommand(commandId: FeatureTemplateCommandId): void {
    if (!feature) {
      return
    }

    setActionResult(executeFeatureTemplateCommand(feature, commandId))
  }

  return {
    feature,
    isLoading,
    actionResult,
    commands: featureTemplateCommands,
    runCommand,
  }
}
