import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

function applyThemeClass(theme: 'light' | 'dark') {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

interface AppShellState {
  currentUser: {
    id: string | null
    name: string | null
    role: string | null
    permissions: string[]
  } | null
  sidebarOpen: boolean
  theme: 'light' | 'dark'
  language: string
  lastUpdated: Record<string, Date>
  setUser: (user: AppShellState['currentUser']) => void
  logout: () => void
  toggleSidebar: () => void
  setTheme: (theme: 'light' | 'dark') => void
  setLanguage: (language: string) => void
  updateLastModified: (module: string) => void
}

export const useAppShellStore = create<AppShellState>()(
  devtools(
    persist(
      (set) => ({
        currentUser: null,
        sidebarOpen: true,
        theme: 'light',
        language: 'en',
        lastUpdated: {},
        setUser: (user) => set({ currentUser: user }),
        logout: () => set({ currentUser: null }),
        toggleSidebar: () =>
          set((state) => ({ sidebarOpen: !state.sidebarOpen })),
        setTheme: (theme) => {
          set({ theme })
          applyThemeClass(theme)
        },
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
          theme: state.theme,
          language: state.language,
          sidebarOpen: state.sidebarOpen,
        }),
        onRehydrateStorage: () => (state) => {
          if (state?.theme) applyThemeClass(state.theme)
        },
      },
    ),
    { name: 'app-shell-store' },
  ),
)
