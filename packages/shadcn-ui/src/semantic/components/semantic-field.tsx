/**
 * SEMANTIC COMPONENT — semantic-field
 * Business-facing semantic field wrapper for labels, hints, errors, and density-aware layout.
 * Semantics: callers provide governed semantic inputs instead of rebuilding field chrome inline.
 * Consumption: prefer this wrapper over ad hoc label-hint-error stacks in feature code.
 * Boundaries: accessibility and density behavior should stay centralized here.
 * Defaults: keep defaults intentional and aligned with semantic doctrine.
 * Changes: preserve semantic contract and accessibility behavior when evolving this component.
 * Purpose: keep field rendering deterministic, accessible, and semantically meaningful.
 *
 * Accessibility contract:
 * SemanticField generates stable IDs for error and hint elements. The consumer is responsible
 * for wiring aria-describedby on the actual form control using the generated IDs. Pass the
 * `id` prop to control the base ID used for derivation; if omitted, a stable ID is generated
 * automatically. The consumer must use the same ID on their control element (htmlFor / id pair)
 * so the label association is correct, and must add aria-describedby pointing to
 * `${id}-error` or `${id}-hint` as appropriate.
 *
 * Example:
 *   <SemanticField id="email" label="Email" error={errors.email}>
 *     <Input id="email" aria-describedby={errors.email ? "email-error" : "email-hint"} />
 *   </SemanticField>
 */
import { useId, type ReactNode, type Ref } from "react"

import { getFieldStackClasses } from "../internal/presentation"
import { cn } from "../../lib/utils"
import type { SemanticDensity } from "../primitives/density"

export interface SemanticFieldProps {
  /** Controls the base ID used for label association and aria-describedby derivation. */
  id?: string
  label: ReactNode
  hint?: ReactNode
  error?: ReactNode
  required?: boolean
  children: ReactNode
  density?: SemanticDensity
  /** Layout composition className. Must not override governed density or field structure. */
  className?: string
  ref?: Ref<HTMLDivElement>
}

export function SemanticField({
  id,
  label,
  hint,
  error,
  required = false,
  children,
  density = "comfortable",
  className,
  ref,
}: SemanticFieldProps) {
  const generatedId = useId()
  const fieldId = id ?? generatedId
  const hintId = hint && !error ? `${fieldId}-hint` : undefined
  const errorId = error ? `${fieldId}-error` : undefined

  return (
    <div
      ref={ref}
      data-slot="semantic-field"
      className={cn(getFieldStackClasses(density), className)}
    >
      <div className="flex items-center gap-1 text-sm font-medium">
        <label htmlFor={fieldId}>{label}</label>
        {required ? (
          <span aria-hidden="true" className="text-destructive">
            *
          </span>
        ) : null}
      </div>
      <div>{children}</div>
      {error ? (
        <div id={errorId} className="text-sm text-destructive" role="alert">
          {error}
        </div>
      ) : hint ? (
        <div id={hintId} className="text-sm text-muted-foreground">
          {hint}
        </div>
      ) : null}
    </div>
  )
}
