import type { RouteObject } from "react-router-dom"

import "../../app/_platform/shell/types/shell-route-handle"

import ForgotPasswordPage from "../../app/_platform/auth/forgot-password"
import LandingPage from "../landing"
import LoginPage from "../../app/_platform/auth/login"
import RegisterPage from "../../app/_platform/auth/register"
import ResetPasswordPage from "../../app/_platform/auth/reset-password"
import { MarketingLayout } from "../provider/marketing-layout"

/** Public routes under `MarketingLayout`: `/`, auth screens. Does not mount the `/app` shell. */
export const marketingRouteObjects: RouteObject[] = [
  {
    path: "/",
    element: <MarketingLayout />,
    children: [
      { index: true, element: <LandingPage />, handle: { shell: null } },
      { path: "login", element: <LoginPage />, handle: { shell: null } },
      { path: "register", element: <RegisterPage />, handle: { shell: null } },
      {
        path: "forgot-password",
        element: <ForgotPasswordPage />,
        handle: { shell: null },
      },
      {
        path: "reset-password",
        element: <ResetPasswordPage />,
        handle: { shell: null },
      },
    ],
  },
]
