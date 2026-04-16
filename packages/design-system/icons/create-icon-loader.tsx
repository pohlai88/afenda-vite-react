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
import type { ComponentProps, ComponentType } from "react"
import { use } from "react"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"

import type { IconLibraryName } from "./libraries"

type SvgProps = ComponentProps<"svg">

const libraryLoaders: Record<
  IconLibraryName,
  () => Promise<Record<string, unknown>>
> = {
  lucide: () => import("./__lucide__"),
  tabler: () => import("./__tabler__"),
  hugeicons: () => import("./__hugeicons__"),
  phosphor: () => import("./__phosphor__"),
  remixicon: () => import("./__remixicon__"),
}

const iconPromiseCaches = new Map<
  IconLibraryName,
  Map<string, Promise<unknown>>
>()

function getCache(libraryName: IconLibraryName) {
  if (!iconPromiseCaches.has(libraryName)) {
    iconPromiseCaches.set(libraryName, new Map())
  }
  return iconPromiseCaches.get(libraryName)!
}

function isIconData(data: unknown): data is IconSvgElement {
  return Array.isArray(data)
}

export function createIconLoader(libraryName: IconLibraryName) {
  const cache = getCache(libraryName)
  const loadModule = libraryLoaders[libraryName]

  return function IconLoader({
    name,
    strokeWidth = 2,
    ...props
  }: {
    name: string
  } & SvgProps) {
    if (!cache.has(name)) {
      const promise = loadModule().then((mod) => {
        const icon = mod[name]
        return icon ?? null
      })
      cache.set(name, promise)
    }

    const iconData = use(cache.get(name)!)

    if (iconData == null) {
      return null
    }

    if (isIconData(iconData)) {
      const hugeStroke =
        typeof strokeWidth === "number"
          ? strokeWidth
          : Number.parseFloat(String(strokeWidth)) || 2
      return (
        <HugeiconsIcon icon={iconData} strokeWidth={hugeStroke} {...props} />
      )
    }

    const IconComponent = iconData as ComponentType<
      SvgProps & { strokeWidth?: number | string }
    >
    return <IconComponent strokeWidth={strokeWidth} {...props} />
  }
}
