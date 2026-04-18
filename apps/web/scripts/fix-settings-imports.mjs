/* global console */
import fs from "node:fs"
import path from "node:path"

const dirs = ["src/share/components/settings", "src/share/components/user"]

function walk(d) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f)
    const st = fs.statSync(p)
    if (st.isDirectory()) walk(p)
    else if (f.endsWith(".tsx")) {
      let c = fs.readFileSync(p, "utf8")
      c = c.replaceAll(
        'from "src/lib/utils"',
        'from "@afenda/design-system/utils"'
      )
      c = c.replaceAll(
        'import { toast } from "@afenda/design-system/ui-primitives/sonner"',
        'import { toast } from "sonner"'
      )
      c = c.replaceAll(
        'from "src/components/ui/alert-dialog"',
        'from "@afenda/design-system/ui-primitives"'
      )
      c = c.replaceAll(
        'from "src/share/components/user/user-avatar"',
        'from "@/share/components/user/user-avatar"'
      )
      c = c.replaceAll(
        'from "src/share/components/user/user-view"',
        'from "@/share/components/user/user-view"'
      )
      fs.writeFileSync(p, c)
    }
  }
}

for (const d of dirs) walk(d)
console.log("fix-settings-imports: ok")
