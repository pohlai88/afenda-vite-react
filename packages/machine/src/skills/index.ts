import type { MachineManifest } from "../core/contracts.js"

export { lynxGeneralSkill } from "./general/lynx-general-skill.js"

import { lynxGeneralSkill } from "./general/lynx-general-skill.js"

export const lynxCoreManifest: MachineManifest = {
  id: "lynx-core",
  name: "Lynx core skills",
  version: "0.0.0",
  skills: [lynxGeneralSkill],
}
