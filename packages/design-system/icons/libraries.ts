/**
 * Afenda design-system — icons (hand-maintained).
 *
 * `createIconLoader` / `Icon*` load icons by `name` via React `use()` and lazy
 * imports of `__lucide__.ts` … `__remixicon__.ts` (generated; do not edit — run
 * `pnpm run icons:generate` in `packages/design-system`; see `build-icons.ts`).
 *
 * `libraries.ts` is generator input; `icon-policy.ts` + ESLint govern dynamic use.
 * Public API: `@afenda/design-system/icons`.
 */
export const iconLibraries = {
  lucide: {
    name: "lucide",
    title: "Lucide",
    packages: ["lucide-react"],
    import: "import { ICON } from 'lucide-react'",
    usage: "<ICON />",
    export: "lucide-react",
  },
  tabler: {
    name: "tabler",
    title: "Tabler Icons",
    packages: ["@tabler/icons-react"],
    import: "import { ICON } from '@tabler/icons-react'",
    usage: "<ICON />",
    export: "@tabler/icons-react",
  },
  hugeicons: {
    name: "hugeicons",
    title: "HugeIcons",
    packages: ["@hugeicons/react", "@hugeicons/core-free-icons"],
    import:
      "import { HugeiconsIcon } from '@hugeicons/react'\nimport { ICON } from '@hugeicons/core-free-icons';",
    usage: "<HugeiconsIcon icon={ICON} strokeWidth={2} />",
    export: "@hugeicons/core-free-icons",
  },
  phosphor: {
    name: "phosphor",
    title: "Phosphor Icons",
    packages: ["@phosphor-icons/react"],
    import: "import { ICON } from '@phosphor-icons/react'",
    usage: "<ICON strokeWidth={2} />",
    export: "@phosphor-icons/react",
  },
  remixicon: {
    name: "remixicon",
    title: "Remix Icon",
    packages: ["@remixicon/react"],
    import: "import { ICON } from '@remixicon/react'",
    usage: "<ICON />",
    export: "@remixicon/react",
  },
} as const

export type IconLibraries = typeof iconLibraries

export type IconLibrary = IconLibraries[keyof IconLibraries]

export type IconLibraryName = keyof IconLibraries
