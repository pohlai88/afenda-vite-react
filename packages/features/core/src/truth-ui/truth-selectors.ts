import type { TruthSeverity, TruthStatus } from '../truth/truth-status'
import type { TruthAlertCategory, TruthAlertItem } from './truth-alert-item'
import { TRUTH_SEVERITY_ORDER } from './truth-severity'

/**
 * Sort items by severity (broken first) then by priority (higher first).
 */
export function sortByPriorityAndSeverity<
  T extends Pick<TruthStatus, 'severity' | 'priority'>,
>(items: readonly T[]): T[] {
  return [...items].sort((a, b) => {
    const severityDiff =
      TRUTH_SEVERITY_ORDER[a.severity] - TRUTH_SEVERITY_ORDER[b.severity]
    if (severityDiff !== 0) return severityDiff
    return (b.priority ?? 0) - (a.priority ?? 0)
  })
}

/**
 * Filter alerts by category.
 */
export function filterByCategory(
  items: readonly TruthAlertItem[],
  category: TruthAlertCategory,
): TruthAlertItem[] {
  return items.filter((item) => item.category === category)
}

/**
 * Filter alerts by severity.
 */
export function filterBySeverity(
  items: readonly TruthAlertItem[],
  severity: TruthSeverity,
): TruthAlertItem[] {
  return items.filter((item) => item.severity === severity)
}

/**
 * Filter unread alerts.
 */
export function filterUnread(
  items: readonly TruthAlertItem[],
): TruthAlertItem[] {
  return items.filter((item) => !item.read)
}

/**
 * Count alerts by severity.
 */
export function countBySeverity(
  items: readonly TruthAlertItem[],
): Record<TruthSeverity, number> {
  const counts: Record<TruthSeverity, number> = {
    valid: 0,
    warning: 0,
    broken: 0,
    pending: 0,
    neutral: 0,
  }
  for (const item of items) {
    counts[item.severity]++
  }
  return counts
}

/**
 * Count alerts by category.
 */
export function countByCategory(
  items: readonly TruthAlertItem[],
): Record<TruthAlertCategory, number> {
  const counts: Record<TruthAlertCategory, number> = {
    invariant: 0,
    financial_integrity: 0,
    system: 0,
    message: 0,
  }
  for (const item of items) {
    counts[item.category]++
  }
  return counts
}

/**
 * Get the highest severity from a list of statuses.
 */
export function getHighestSeverity(
  items: readonly Pick<TruthStatus, 'severity'>[],
): TruthSeverity {
  if (items.length === 0) return 'valid'
  let highest: TruthSeverity = 'valid'
  let highestOrder = TRUTH_SEVERITY_ORDER[highest]
  for (const item of items) {
    const order = TRUTH_SEVERITY_ORDER[item.severity]
    if (order < highestOrder) {
      highest = item.severity
      highestOrder = order
    }
  }
  return highest
}
