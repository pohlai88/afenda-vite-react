import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import type { TruthHealthSummary } from '@afenda/core/truth'
import type { TruthAlertItem } from '@afenda/core/truth-ui'

interface TruthHealthState {
  /** Aggregated health summary for current scope */
  health: TruthHealthSummary | null
  /** All alerts for current scope */
  alerts: readonly TruthAlertItem[]

  /** Update health summary (typically from API response) */
  setHealth: (health: TruthHealthSummary) => void
  /** Add a new alert */
  addAlert: (alert: TruthAlertItem) => void
  /** Add multiple alerts */
  addAlerts: (alerts: readonly TruthAlertItem[]) => void
  /** Mark an alert as read */
  markRead: (alertId: string) => void
  /** Mark all alerts as read */
  markAllRead: () => void
  /** Remove an alert */
  removeAlert: (alertId: string) => void
  /** Clear all alerts */
  clearAlerts: () => void
  /** Reset entire health state */
  reset: () => void
}

const INITIAL_STATE = {
  health: null,
  alerts: [],
}

export const useTruthHealthStore = create<TruthHealthState>()(
  devtools(
    (set) => ({
      ...INITIAL_STATE,

      setHealth: (health) => set({ health }),

      addAlert: (alert) =>
        set((state) => ({
          alerts: [alert, ...state.alerts],
        })),

      addAlerts: (newAlerts) =>
        set((state) => ({
          alerts: [...newAlerts, ...state.alerts],
        })),

      markRead: (alertId) =>
        set((state) => ({
          alerts: state.alerts.map((a) =>
            a.id === alertId ? { ...a, read: true } : a,
          ),
        })),

      markAllRead: () =>
        set((state) => ({
          alerts: state.alerts.map((a) => ({ ...a, read: true })),
        })),

      removeAlert: (alertId) =>
        set((state) => ({
          alerts: state.alerts.filter((a) => a.id !== alertId),
        })),

      clearAlerts: () => set({ alerts: [] }),

      reset: () => set(INITIAL_STATE),
    }),
    { name: 'truth-health-store' },
  ),
)
