import { createBrowserRouter, Navigate } from 'react-router-dom'

import { featureRoutes } from './feature-routes'
import { marketingRoutes } from './marketing-routes'

const legacyFeatureRedirects = [
  '/login',
  '/dashboard',
  '/inventory',
  '/sales',
  '/customers',
  '/employees',
  '/finance',
  '/reports',
  '/settings',
]

export const appRouter = createBrowserRouter([
  ...marketingRoutes,
  ...featureRoutes,
  ...legacyFeatureRedirects.map((path) => ({
    path,
    element: <Navigate to={`/app${path}`} replace />,
  })),
  { path: '*', element: <Navigate to="/" replace /> },
])
