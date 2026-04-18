/**
 * Vitest: `views/index.ts` barrel must stay in lockstep with {@link ./views-inventory.ts}.
 */
import { describe, expect, it } from "vitest"

import * as ViewsBarrel from "../index"
import { VIEW_EXPORT_NAMES } from "./views-inventory"

describe("views/index barrel manifest", () => {
  it("runtime export keys equal the view inventory exactly", () => {
    expect(new Set(Object.keys(ViewsBarrel))).toEqual(new Set(VIEW_EXPORT_NAMES))
  })
})
