/**
 * UTILITY MODULE — utils
 * Shared low-level utility helpers for the package.
 * Scope: provides generic helpers that are safe to reuse across authored source files.
 * Consumption: keep utilities small, deterministic, and free of feature-specific semantics.
 * Boundaries: semantic doctrine belongs elsewhere; this file should stay infrastructure-level.
 * Changes: evolve carefully because many authored files may depend on these helpers.
 * Purpose: provide minimal reusable infrastructure without semantic drift.
 */
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
