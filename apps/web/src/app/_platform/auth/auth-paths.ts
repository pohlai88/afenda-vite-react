/**
 * Canonical auth URLs for the Vite SPA (leading slash; React Router `basename` applies when configured).
 */
export const AUTH_ROUTES = {
  login: "/auth/login",
  register: "/auth/register",
  forgotPassword: "/auth/forgot-password",
  resetPassword: "/auth/reset-password",
  callback: "/auth/callback",
} as const
