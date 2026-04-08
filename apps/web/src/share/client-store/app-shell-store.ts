import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

import { useActionBarPrefsStore } from './action-bar-prefs-store'

export type SidebarMode = 'expanded' | 'collapsed' | 'hover'

interface AppShellState {
  currentUser: {
    id: string | null
    name: string | null
    role: string | null
    permissions: string[]
  } | null
  /** Persisted user preference: expanded, collapsed, or expand-on-hover. */
  sidebarMode: SidebarMode
  language: string
  lastUpdated: Record<string, Date>
  setUser: (user: AppShellState['currentUser']) => void
  logout: () => void
  setSidebarMode: (mode: SidebarMode) => void
  setLanguage: (language: string) => void
  updateLastModified: (module: string) => void
}

export const useAppShellStore = create<AppShellState>()(
  devtools(
    persist(
      (set) => ({
        currentUser: null,
        sidebarMode: 'expanded',
        language: 'en',
        lastUpdated: {},
        setUser: (user) => set({ currentUser: user }),
        logout: () => {
          useActionBarPrefsStore.getState().clearActivePrefsContext()
          set({ currentUser: null })
        },
        setSidebarMode: (sidebarMode) => set({ sidebarMode }),
        setLanguage: (language) => set({ language }),
        updateLastModified: (module) =>
          set((state) => ({
            lastUpdated: {
              ...state.lastUpdated,
              [module]: new Date(),
            },
          })),
      }),
      {
        name: 'app-shell-store',
        partialize: (state) => ({
          language: state.language,
          sidebarMode: state.sidebarMode,
        }),
        onRehydrateStorage: () => (state) => {
          // Migrate legacy `sidebarOpen: boolean` persisted by earlier versions.
          if (state && !state.sidebarMode) {
            const legacy = (state as unknown as Record<string, unknown>)['sidebarOpen']
            state.sidebarMode = legacy === false ? 'collapsed' : 'expanded'
          }
        },
      },
    ),
    { name: 'app-shell-store' },
  ),
)
