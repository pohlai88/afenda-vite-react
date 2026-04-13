import { Suspense } from "react"
import { RouterProvider } from "react-router-dom"
import { TooltipProvider } from "@afenda/shadcn-ui-deprecated"
import { ThemeProvider } from "@/share/components/theme"
import { QueryProvider } from "@/share/components/providers"
import { appRouter } from "./share/routing/router"

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <TooltipProvider delayDuration={0}>
        <QueryProvider>
          <Suspense
            fallback={
              <div className="p-4 text-sm text-muted-foreground">Loading…</div>
            }
          >
            <RouterProvider router={appRouter} />
          </Suspense>
        </QueryProvider>
      </TooltipProvider>
    </ThemeProvider>
  )
}
