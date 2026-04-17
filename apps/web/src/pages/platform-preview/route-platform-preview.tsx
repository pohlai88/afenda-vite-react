import { Navigate, Outlet } from "react-router-dom"

import "../../styles/platform-preview-chambers.css"

import {
  DEFAULT_TRUTH_CHAMBER,
} from "./data/platform-preview-truth-seed"
import { PlatformPreviewChamberStep } from "./components/platform-preview-chamber-step"
import { PlatformPreviewThresholdStep } from "./components/platform-preview-threshold-step"

export function RoutePlatformPreview() {
  return <Outlet />
}

export function RoutePlatformPreviewThreshold() {
  return <PlatformPreviewThresholdStep />
}

export function RoutePlatformPreviewChamber() {
  return <PlatformPreviewChamberStep />
}

export function RoutePlatformPreviewFallbackRedirect() {
  return <Navigate replace to={`/platform-preview/${DEFAULT_TRUTH_CHAMBER}`} />
}
