import { useCallback, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  AlertTriangleIcon,
  FileTextIcon,
  MoonIcon,
  SearchIcon,
  SunIcon,
} from 'lucide-react'
import { useTheme } from '@/components/theme-provider'
import { useTranslation } from 'react-i18next'

import { useGlobalSearch } from '@/share/components/providers'
import { useAppShellStore } from '@/share/client-store'

import { useNavItems } from '../navigation'
import { rankAndDedupeCommands } from './command-palette-utils'
import {
  type PaletteCommand,
  type PaletteGroup,
  PALETTE_GROUP_ORDER,
} from './command-palette.types'

const MAX_SUGGESTED = 5

/** Extra search tokens by nav path segment (after `/app/`). */
const PATH_KEYWORD_ALIASES: Readonly<Record<string, readonly string[]>> = {
  dashboard: ['home', 'start'],
  finance: ['money', 'ledger', 'accounting'],
  invoices: ['invoice', 'billing', 'ar'],
  allocations: ['allocation', 'distribute'],
  settlements: ['settlement', 'payment'],
  inventory: ['stock', 'warehouse'],
  sales: ['orders', 'revenue'],
  customers: ['customer', 'crm'],
  employees: ['employee', 'hr', 'staff'],
  reports: ['report', 'analytics'],
  settings: ['preferences', 'config'],
}

function pathSegment(to: string): string {
  const trimmed = to.replace(/^\/+/, '')
  const parts = trimmed.split('/').filter(Boolean)
  if (parts[0] === 'app' && parts[1]) return parts[1]
  return parts[0] ?? ''
}

function collectNavKeywords(label: string, segment: string): string[] {
  const lower = (s: string) => s.toLowerCase()
  const tokens = new Set<string>()
  for (const w of label.split(/\s+/)) {
    const t = w.trim()
    if (t) tokens.add(lower(t))
  }
  if (segment) {
    tokens.add(lower(segment))
    for (const w of segment.split(/[-_]/)) {
      if (w) tokens.add(lower(w))
    }
  }
  const aliases = PATH_KEYWORD_ALIASES[segment]
  if (aliases) {
    for (const a of aliases) tokens.add(lower(a))
  }
  return [...tokens]
}

function pickSuggestedCommands(
  pathname: string,
  registry: ReadonlyMap<string, PaletteCommand>,
): PaletteCommand[] {
  const out: PaletteCommand[] = []
  const used = new Set<string>()

  const pushById = (id: string) => {
    const cmd = registry.get(id)
    if (!cmd || used.has(id)) return
    used.add(id)
    out.push({ ...cmd, group: 'suggested' })
  }

  const segMatch = (segment: string) =>
    pathname.includes(`/app/${segment}`) || pathname.endsWith(`/${segment}`)

  if (segMatch('invoices')) {
    pushById('navigate:/app/invoices')
    pushById('action:create-invoice')
    pushById('navigate:/app/settlements')
  } else if (segMatch('finance')) {
    pushById('navigate:/app/finance')
    pushById('navigate:/app/invoices')
    pushById('navigate:/app/allocations')
  } else if (segMatch('allocations')) {
    pushById('navigate:/app/allocations')
    pushById('navigate:/app/invoices')
  } else if (segMatch('settlements')) {
    pushById('navigate:/app/settlements')
    pushById('navigate:/app/invoices')
  } else if (segMatch('settings')) {
    pushById('navigate:/app/settings')
  } else {
    const seg = pathSegment(pathname)
    if (seg) pushById(`navigate:/app/${seg}`)
  }

  if (out.length < 3) {
    pushById('navigate:/app/dashboard')
  }

  return out.slice(0, MAX_SUGGESTED)
}

export interface UsePaletteCommandsResult {
  readonly groups: ReadonlyMap<PaletteGroup, readonly PaletteCommand[]>
  readonly togglePin: (commandId: string) => void
  readonly isPinned: (commandId: string) => boolean
}

const EMPTY_PERMISSIONS: readonly string[] = []

/**
 * Builds normalized, deduped, ranked palette commands (static + dynamic) for {@link CommandPalette}.
 */
export function usePaletteCommands(
  closePalette: () => void,
): UsePaletteCommandsResult {
  const { t } = useTranslation('shell')
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { setTheme } = useTheme()
  const { groups: navGroups } = useNavItems()
  const permissions = useAppShellStore(
    (s) => s.currentUser?.permissions ?? EMPTY_PERMISSIONS,
  )

  const {
    recentCommands,
    addRecentCommand,
    pinnedCommands,
    togglePinCommand,
    isCommandPinned,
  } = useGlobalSearch()

  const wrap = useCallback(
    (id: string, run: () => void) => {
      return () => {
        addRecentCommand(id)
        closePalette()
        run()
      }
    },
    [addRecentCommand, closePalette],
  )

  const baseRegistry = useMemo(() => {
    const map = new Map<string, PaletteCommand>()

    for (const group of navGroups) {
      for (const item of group.items) {
        const segment = pathSegment(item.to)
        const keywords = collectNavKeywords(item.label, segment)
        const id = `navigate:${item.to}`
        const Icon = item.icon ?? SearchIcon
        map.set(id, {
          id,
          kind: 'navigate',
          group: 'search',
          section: group.label,
          title: item.label,
          subtitle: item.to,
          keywords,
          icon: Icon,
          priority: 40,
          pinEligible: true,
          run: wrap(id, () => {
            void navigate(item.to)
          }),
        })
      }
    }

    if (permissions.includes('finance:read')) {
      map.set('action:create-invoice', {
        id: 'action:create-invoice',
        kind: 'action',
        group: 'actions',
        title: t('command_palette.action_create_invoice'),
        subtitle: '/app/invoices',
        keywords: ['create', 'invoice', 'new', 'billing', 'ar'],
        icon: FileTextIcon,
        shortcut: undefined,
        priority: 55,
        pinEligible: true,
        run: wrap('action:create-invoice', () => {
          void navigate('/app/invoices')
        }),
      })
    }

    map.set('action:open-audit', {
      id: 'action:open-audit',
      kind: 'action',
      group: 'actions',
      title: t('command_palette.action_open_audit'),
      subtitle: '/app/audit',
      keywords: ['audit', 'invariants', 'compliance'],
      icon: AlertTriangleIcon,
      priority: 30,
      pinEligible: true,
      run: wrap('action:open-audit', () => {
        void navigate('/app/audit')
      }),
    })

    map.set('setting:theme-light', {
      id: 'setting:theme-light',
      kind: 'setting',
      group: 'settings',
      title: t('theme.light'),
      keywords: ['theme', 'light', 'mode', 'appearance'],
      icon: SunIcon,
      priority: 10,
      pinEligible: false,
      run: wrap('setting:theme-light', () => {
        setTheme('light')
      }),
    })
    map.set('setting:theme-dark', {
      id: 'setting:theme-dark',
      kind: 'setting',
      group: 'settings',
      title: t('theme.dark'),
      keywords: ['theme', 'dark', 'mode', 'appearance'],
      icon: MoonIcon,
      priority: 9,
      pinEligible: false,
      run: wrap('setting:theme-dark', () => {
        setTheme('dark')
      }),
    })

    return map
  }, [navigate, navGroups, permissions, setTheme, t, wrap])

  const groups = useMemo(() => {
    const registry = baseRegistry
    const result = new Map<PaletteGroup, PaletteCommand[]>()
    for (const g of PALETTE_GROUP_ORDER) {
      result.set(g, [])
    }

    const promoted = new Set<string>()

    const recentOrdered = recentCommands
      .map((r) => registry.get(r.commandId))
      .filter((c): c is PaletteCommand => Boolean(c))
      .slice(0, 5)
    for (const c of recentOrdered) {
      result.get('recent')!.push({ ...c, group: 'recent' })
      promoted.add(c.id)
    }

    const pinnedOrdered = pinnedCommands
      .map((p) => registry.get(p.commandId))
      .filter((c): c is PaletteCommand => Boolean(c))
    for (const c of pinnedOrdered) {
      if (promoted.has(c.id)) continue
      result.get('pinned')!.push({ ...c, group: 'pinned' })
      promoted.add(c.id)
    }

    const suggested = pickSuggestedCommands(pathname, registry)
    for (const c of suggested) {
      if (promoted.has(c.id)) continue
      result.get('suggested')!.push(c)
      promoted.add(c.id)
    }

    for (const cmd of registry.values()) {
      if (promoted.has(cmd.id)) continue
      const bucket = result.get(cmd.group)
      if (bucket) bucket.push(cmd)
    }

    for (const g of PALETTE_GROUP_ORDER) {
      const list = result.get(g)
      if (list) {
        result.set(g, rankAndDedupeCommands(list))
      }
    }

    return result
  }, [baseRegistry, pathname, pinnedCommands, recentCommands])

  const togglePin = useCallback(
    (commandId: string) => {
      togglePinCommand(commandId)
    },
    [togglePinCommand],
  )

  return {
    groups,
    togglePin,
    isPinned: isCommandPinned,
  }
}
