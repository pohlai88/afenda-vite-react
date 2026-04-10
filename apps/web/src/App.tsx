/**
 * RESPONSIBILITY ENVELOPE
 * File role: top-level React app composition.
 * Owns: providers, suspense boundaries, router mounting, shell orchestration.
 * Must own only application composition concerns.
 * Must not own startup bootstrapping or global styling rules.
 * Safe edits: provider order, app-wide suspense, router handoff.
 * Unsafe edits: DOM mount code, token definitions, page-specific CSS.
 * Styling rule: consume shared app classes and tokens, do not define them here.
 * Related files: `main.tsx`, `share/routing/router.tsx`, `index.css`.
 */
import { Suspense } from "react"
import { useTranslation } from "react-i18next"
import { RouterProvider } from "react-router-dom"
import { TooltipProvider } from "@afenda/shadcn-ui"
import { Toaster } from "@afenda/shadcn-ui/components/ui/sonner"
import { ThemeProvider } from "@/components/theme-provider"
import { QueryProvider } from "@/share/components/providers"
import { appRouter } from "./share/routing/router"

function AppShell() {
  const { t } = useTranslation("shell")
  return (
    <QueryProvider>
      <Suspense
        fallback={<div className="loading">{t("loading.erp_system")}</div>}
      >
        <RouterProvider router={appRouter} />
      </Suspense>
      <Toaster richColors position="top-right" />
    </QueryProvider>
  )
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <TooltipProvider delayDuration={0}>
        <AppShell />
      </TooltipProvider>
    </ThemeProvider>
  )
}

export default App
