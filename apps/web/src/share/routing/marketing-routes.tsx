import type { RouteObject } from 'react-router-dom'
import LandingPage from '@/pages/Landing'

export const marketingRoutes: RouteObject[] = [
  { path: '/', element: <LandingPage /> },
]
