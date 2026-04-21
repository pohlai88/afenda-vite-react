import { useCallback, useEffect, useMemo, useState } from "react"

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
import { resolveFeatureTemplateSlug } from "../feature-template-policy"

export interface UseFeatureTemplateResult {
  readonly feature: FeatureTemplateDefinition | null
  readonly isLoading: boolean
  readonly errorMessage: string | null
  readonly actionResult: FeatureTemplateCommandResult | null
  readonly commands: typeof featureTemplateCommands
  readonly runCommand: (commandId: FeatureTemplateCommandId) => void
  readonly reload: () => void
}

export function useFeatureTemplate(
  routeSlug: string | undefined
): UseFeatureTemplateResult {
  const slug = useMemo(() => resolveFeatureTemplateSlug(routeSlug), [routeSlug])
  const [feature, setFeature] = useState<FeatureTemplateDefinition | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [actionResult, setActionResult] =
    useState<FeatureTemplateCommandResult | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  const reload = useCallback(() => {
    setReloadToken((value) => value + 1)
  }, [])

  useEffect(() => {
    let isActive = true

    async function loadFeatureTemplate(): Promise<void> {
      setIsLoading(true)
      setErrorMessage(null)

      try {
        const nextFeature = await fetchFeatureTemplate(slug)

        if (!isActive) {
          return
        }

        setFeature(nextFeature)
        setActionResult((current) =>
          current &&
          current.commandId === "refresh-view" &&
          current.featureSlug === nextFeature.slug
            ? current
            : null
        )
      } catch (error) {
        if (!isActive) {
          return
        }

        setFeature(null)
        setActionResult(null)
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load the feature template."
        )
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    void loadFeatureTemplate()

    return () => {
      isActive = false
    }
  }, [slug, reloadToken])

  const runCommand = useCallback(
    (commandId: FeatureTemplateCommandId): void => {
      if (!feature) {
        return
      }

      const result = executeFeatureTemplateCommand(feature, commandId)
      setActionResult(result)

      if (commandId === "refresh-view") {
        reload()
      }
    },
    [feature, reload]
  )

  return {
    feature,
    isLoading,
    errorMessage,
    actionResult,
    commands: featureTemplateCommands,
    runCommand,
    reload,
  }
}
