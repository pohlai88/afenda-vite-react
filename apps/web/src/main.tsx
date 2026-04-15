import "./vite-preload-recovery"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import App from "./App"
import { initI18n } from "./app/_platform/i18n"

function getRootContainer(): HTMLElement {
  const el = document.getElementById("root")
  if (!el) {
    throw new Error(
      'Afenda web: missing #root element. Ensure apps/web/index.html defines <div id="root"></div>.'
    )
  }
  return el
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: import.meta.env.PROD,
    },
  },
})

void initI18n().then(() => {
  createRoot(getRootContainer()).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </StrictMode>
  )
})
