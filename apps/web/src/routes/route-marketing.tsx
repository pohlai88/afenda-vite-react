/**
 * Public (unauthenticated) route tree: landing and auth screens under `/`.
 *
 * - Mounted with `MarketingLayout`; does **not** use the ERP `/app` shell.
 * - Every leaf declares `handle: { shell: null }` so shell policy stays explicit.
 * - Add new marketing/auth paths here, then ensure i18n and links stay consistent.
 *
 * For how this composes into `browserRoutes` and who calls `createBrowserRouter`, see the package doc below—not this file.
 *
 * @see ./README.md — router usage, marketing vs `/app/*`, and adding routes.
 */

import type { RouteObject } from "react-router-dom"
import { Navigate } from "react-router-dom"

import InfiniteTopologyPage from "../pages/marketing/InfiniteTopology"
import LandingPage from "../pages/landing"
import SingularityPage from "../pages/marketing/singularity"
import {
  RoutePlatformPreviewChamber,
  RoutePlatformPreview,
  RoutePlatformPreviewFallbackRedirect,
  RoutePlatformPreviewThreshold,
} from "@/pages/platform-preview"
import {
  RouteAuthCallback,
  RouteAuthForgotPassword,
  RouteAuthLogin,
  RouteAuthRegister,
  RouteAuthResetPassword,
} from "../app/_platform/auth"
import { MarketingLayout } from "../pages/provider/marketing-layout"

/** Public routes under `MarketingLayout`: `/`, auth screens. Does not mount the `/app` shell. */
export const marketingRouteObjects: RouteObject[] = [
  {
    path: "/",
    element: <MarketingLayout />,
    children: [
      { index: true, element: <LandingPage />, handle: { shell: null } },
      {
        path: "marketing",
        element: <LandingPage />,
        handle: { shell: null },
      },
      {
        path: "infinite-topology",
        element: <InfiniteTopologyPage />,
        handle: { shell: null },
      },
      {
        path: "infinitetopology",
        element: <Navigate to="/infinite-topology" replace />,
        handle: { shell: null },
      },
      { path: "singularity", element: <SingularityPage />, handle: { shell: null } },
      {
        path: "platform-preview",
        element: <RoutePlatformPreview />,
        handle: { shell: null },
        children: [
          {
            index: true,
            element: <RoutePlatformPreviewThreshold />,
            handle: { shell: null },
          },
          {
            path: ":chamber",
            element: <RoutePlatformPreviewChamber />,
            handle: { shell: null },
          },
          {
            path: "*",
            element: <RoutePlatformPreviewFallbackRedirect />,
            handle: { shell: null },
          },
        ],
      },
      {
        path: "auth/login",
        element: <RouteAuthLogin />,
        handle: { shell: null },
      },
      {
        path: "auth/register",
        element: <RouteAuthRegister />,
        handle: { shell: null },
      },
      {
        path: "auth/forgot-password",
        element: <RouteAuthForgotPassword />,
        handle: { shell: null },
      },
      {
        path: "auth/reset-password",
        element: <RouteAuthResetPassword />,
        handle: { shell: null },
      },
      {
        path: "auth/callback",
        element: <RouteAuthCallback />,
        handle: { shell: null },
      },
      {
        path: "login",
        element: <Navigate to="/auth/login" replace />,
        handle: { shell: null },
      },
      {
        path: "register",
        element: <Navigate to="/auth/register" replace />,
        handle: { shell: null },
      },
      {
        path: "forgot-password",
        element: <Navigate to="/auth/forgot-password" replace />,
        handle: { shell: null },
      },
      {
        path: "reset-password",
        element: <Navigate to="/auth/reset-password" replace />,
        handle: { shell: null },
      },
    ],
  },
]
