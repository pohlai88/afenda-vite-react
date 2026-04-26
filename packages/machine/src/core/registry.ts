import type { MachineManifest, MachineSkillDefinition } from "./contracts.js"

export interface MachineRegistry {
  readonly manifests: readonly MachineManifest[]
  readonly skills: readonly MachineSkillDefinition[]
  readonly listSkills: () => readonly MachineSkillDefinition[]
  readonly getSkill: (id: string) => MachineSkillDefinition | undefined
}

export function createMachineRegistry(
  manifests: readonly MachineManifest[]
): MachineRegistry {
  const manifestIds = new Set<string>()
  const skillsById = new Map<string, MachineSkillDefinition>()

  for (const manifest of manifests) {
    if (manifestIds.has(manifest.id)) {
      throw new Error(
        `Machine manifest "${manifest.id}" is registered more than once.`
      )
    }

    manifestIds.add(manifest.id)

    for (const skill of manifest.skills) {
      if (skillsById.has(skill.id)) {
        throw new Error(`Machine skill "${skill.id}" is registered twice.`)
      }

      skillsById.set(skill.id, skill)
    }
  }

  const skills = Array.from(skillsById.values())

  return {
    manifests,
    skills,
    listSkills: () => skills,
    getSkill: (id) => skillsById.get(id),
  }
}
