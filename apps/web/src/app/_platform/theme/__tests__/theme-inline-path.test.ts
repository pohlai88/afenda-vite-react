import { describe, expect, it } from "vitest"

import { isAppShellPath, pathAfterViteBase } from "../theme-inline-path"

describe("pathAfterViteBase", () => {
  it("leaves pathname unchanged when base is root", () => {
    expect(pathAfterViteBase("/app/events", "/")).toBe("/app/events")
    expect(pathAfterViteBase("/", "/")).toBe("/")
  })

  it("strips a subpath base to match router segments", () => {
    expect(pathAfterViteBase("/my-app/app/events", "/my-app/")).toBe(
      "/app/events"
    )
    expect(pathAfterViteBase("/my-app/", "/my-app/")).toBe("/")
    expect(pathAfterViteBase("/my-app", "/my-app/")).toBe("/")
  })

  it("handles base without trailing slash", () => {
    expect(pathAfterViteBase("/my-app/login", "/my-app")).toBe("/login")
  })
})

describe("isAppShellPath", () => {
  it("detects /app for root base", () => {
    expect(isAppShellPath("/app", "/")).toBe(true)
    expect(isAppShellPath("/app/events", "/")).toBe(true)
    expect(isAppShellPath("/", "/")).toBe(false)
    expect(isAppShellPath("/login", "/")).toBe(false)
  })

  it("detects /app after stripping base", () => {
    expect(isAppShellPath("/acme/app/foo", "/acme/")).toBe(true)
    expect(isAppShellPath("/acme/login", "/acme/")).toBe(false)
  })
})
