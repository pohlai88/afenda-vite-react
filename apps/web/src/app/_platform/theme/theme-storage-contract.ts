export const AFENDA_THEME_STORAGE_KEYS = {
  app: "vite-ui-theme",
  marketing: "vite-ui-marketing-theme",
} as const

export const AFENDA_UI_STORAGE_KEYS = {
  density: "vite-ui-density",
  motion: "vite-ui-motion-preference",
} as const

export const AFENDA_THEME_BOOT_HTML_TOKENS = {
  viteBase: "__VITE_RESOLVED_BASE_JSON__",
  appThemeStorageKey: "__AFENDA_APP_THEME_STORAGE_KEY_JSON__",
  marketingThemeStorageKey: "__AFENDA_MARKETING_THEME_STORAGE_KEY_JSON__",
  densityStorageKey: "__AFENDA_UI_DENSITY_STORAGE_KEY_JSON__",
  motionStorageKey: "__AFENDA_UI_MOTION_STORAGE_KEY_JSON__",
} as const
