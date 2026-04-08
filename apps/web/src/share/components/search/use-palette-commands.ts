import { useCallback, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  AlertTriangleIcon,
  ArrowLeftRightIcon,
  FileTextIcon,
  MoonIcon,
  SearchIcon,
  SparklesIcon,
  SunIcon,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { useTranslation } from 'react-i18next'

import type { TruthStatus } from '@afenda/core/truth'
import type { ResolutionSuggestion } from '@afenda/core/truth-ui'

import { useGlobalSearch } from '@/share/components/providers'
import { useAppShellStore } from '@/share/client-store'
import { TRUTH_DEMO_RESOLUTIONS } from '@/share/client-store/truth-demo-seed'
import { useTruthHealthStore } from '@/share/client-store/truth-health-store'
import { useTruthScopeStore } from '@/share/client-store/truth-scope-store'
import { useTruthShellBootstrap } from '@/share/client-store/truth-shell-bootstrap'

import { useNavItems } from '../navigation'
import { rankAndDedupeCommands } from './command-palette-utils'
import {
  type PaletteCommand,
  type PaletteGroup,
  PALETTE_GROUP_ORDER,
} from './command-palette.types'

const MAX_AUDIT_ROWS = 5
const MAX_RESOLVE_ROWS = 5
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

function failureRank(f: TruthStatus): number {
  const sev =
    f.severity === 'broken'
      ? 1000
      : f.severity === 'warning'
        ? 500
        : f.severity === 'pending'
          ? 200
          : 0
  return sev + (f.priority ?? 0)
}

function sortedFailures(failures: readonly TruthStatus[]): TruthStatus[] {
  return [...failures].sort((a, b) => failureRank(b) - failureRank(a))
}

function actionPathRequiresFinance(path: string | undefined): boolean {
  if (!path) return false
  return (
    path.startsWith('/app/finance') ||
    path.startsWith('/app/invoices') ||
    path.startsWith('/app/allocations') ||
    path.startsWith('/app/settlements')
  )
}

function isResolutionPermitted(
  suggestion: ResolutionSuggestion,
  permissions: readonly string[],
): boolean {
  const p = suggestion.resolution.actionPath
  if (actionPathRequiresFinance(p)) {
    return permissions.includes('finance:read')
  }
  return true
}

function isFailurePermitted(
  failure: TruthStatus,
  permissions: readonly string[],
): boolean {
  const p = failure.resolution?.actionPath
  if (actionPathRequiresFinance(p)) {
    return permissions.includes('finance:read')
  }
  return true
}

function pickSuggestedCommands(
  pathname: string,
  registry: ReadonlyMap<string, PaletteCommand>,
  failures: readonly TruthStatus[],
  resolutions: readonly ResolutionSuggestion[],
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

  if (failures.length > 0) {
    const top = sortedFailures(failures)[0]
    if (top) pushById(`audit:${top.invariantKey}`)
  }
  if (resolutions.length > 0) {
    const top = [...resolutions].sort((a, b) => b.confidence - a.confidence)[0]
    if (top) pushById(`resolve:${top.id}`)
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
  useTruthShellBootstrap()
  const { t } = useTranslation('shell')
  const navigate = useNavigate()
  const { setTheme } = useTheme()
  const { pathname } = useLocation()
  const { groups: navGroups } = useNavItems()
  const health = useTruthHealthStore((s) => s.health)
  const subsidiaryList = useTruthScopeStore((s) => s.subsidiaryList)
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

  const allFailures = useMemo<readonly TruthStatus[]>(() => {
    const failures = health?.invariantFailures ?? []
    const warnings = health?.warnings ?? []
    if (warnings.length === 0) return failures
    if (failures.length === 0) return warnings
    const seen = new Set(failures.map((f) => f.invariantKey))
    const unique = warnings.filter((w) => !seen.has(w.invariantKey))
    return [...failures, ...unique]
  }, [health])
  const resolutions = TRUTH_DEMO_RESOLUTIONS

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

    const rankedFailures = sortedFailures(allFailures).filter((f) =>
      isFailurePermitted(f, permissions),
    )
    const topFailures = rankedFailures.slice(0, MAX_AUDIT_ROWS)
    for (const failure of topFailures) {
      const id = `audit:${failure.invariantKey}`
      const target =
        failure.resolution?.actionPath ??
        '/app/finance' /** sensible default for demo FX/allocation issues */
      const kw = new Set<string>([
        'audit',
        'truth',
        'invariant',
        'explain',
        'fix',
        'resolve',
        failure.invariantKey.toLowerCase(),
        failure.message.toLowerCase(),
        ...failure.message
          .toLowerCase()
          .split(/\s+/)
          .filter((w) => w.length > 2),
      ])
      if (failure.doctrineRef) kw.add(failure.doctrineRef.toLowerCase())
      if (failure.entityRefs) {
        for (const ref of failure.entityRefs) kw.add(ref.toLowerCase())
      }
      const subtitleParts = [failure.invariantKey]
      if (failure.doctrineRef) subtitleParts.push(failure.doctrineRef)
      if (failure.entityRefs?.length)
        subtitleParts.push(failure.entityRefs.join(', '))
      map.set(id, {
        id,
        kind: 'audit',
        group: 'audit',
        title: failure.message,
        subtitle: subtitleParts.join(' · '),
        keywords: [...kw],
        icon: AlertTriangleIcon,
        priority: failureRank(failure),
        severity: failure.severity,
        entityRefs: failure.entityRefs,
        pinEligible: true,
        run: wrap(id, () => {
          void navigate(target)
        }),
      })
    }

    if (rankedFailures.length > MAX_AUDIT_ROWS) {
      const id = 'audit:view-all'
      map.set(id, {
        id,
        kind: 'audit',
        group: 'audit',
        title: t('command_palette.view_all_failures', {
          count: rankedFailures.length,
        }),
        subtitle: '/app/audit',
        keywords: ['audit', 'all', 'failures', 'invariants', 'truth'],
        icon: AlertTriangleIcon,
        priority: 5,
        pinEligible: false,
        run: wrap(id, () => {
          void navigate('/app/audit')
        }),
      })
    }

    const rankedResolutions = [...resolutions]
      .filter((s) => isResolutionPermitted(s, permissions))
      .sort((a, b) => b.confidence - a.confidence)
    const topRes = rankedResolutions.slice(0, MAX_RESOLVE_ROWS)
    for (const suggestion of topRes) {
      const id = `resolve:${suggestion.id}`
      const target = suggestion.resolution.actionPath ?? '/app/dashboard'
      const kw = new Set<string>([
        'resolve',
        'fix',
        'suggestion',
        suggestion.problemKey.toLowerCase(),
        suggestion.suggestedAction.toLowerCase(),
        ...suggestion.description
          .toLowerCase()
          .split(/\s+/)
          .filter((w) => w.length > 2),
      ])
      if (suggestion.doctrineRef) kw.add(suggestion.doctrineRef.toLowerCase())
      const resolveSubtitleParts = [suggestion.description]
      if (suggestion.doctrineRef)
        resolveSubtitleParts.push(suggestion.doctrineRef)
      map.set(id, {
        id,
        kind: 'resolve',
        group: 'resolve',
        title: suggestion.suggestedAction,
        subtitle: resolveSubtitleParts.join(' · '),
        keywords: [...kw],
        icon: SparklesIcon,
        priority: Math.round(suggestion.confidence * 100),
        confidence: suggestion.confidence,
        pinEligible: true,
        run: wrap(id, () => {
          void navigate(target)
        }),
      })
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

    if (subsidiaryList.length > 1) {
      map.set('action:switch-subsidiary', {
        id: 'action:switch-subsidiary',
        kind: 'action',
        group: 'actions',
        title: t('command_palette.action_switch_subsidiary'),
        subtitle: t('command_palette.action_switch_subsidiary_hint'),
        keywords: ['subsidiary', 'scope', 'entity', 'switch', 'org'],
        icon: ArrowLeftRightIcon,
        priority: 35,
        pinEligible: true,
        run: wrap('action:switch-subsidiary', () => {
          void navigate('/app/settings')
        }),
      })
    }

    map.set('action:open-audit', {
      id: 'action:open-audit',
      kind: 'action',
      group: 'actions',
      title: t('command_palette.action_open_audit'),
      subtitle: '/app/audit',
      keywords: ['audit', 'truth', 'invariants', 'compliance'],
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
  }, [
    allFailures,
    navigate,
    navGroups,
    permissions,
    resolutions,
    setTheme,
    subsidiaryList.length,
    t,
    wrap,
  ])

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

    const suggested = pickSuggestedCommands(
      pathname,
      registry,
      allFailures,
      resolutions,
    )
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
  }, [
    baseRegistry,
    allFailures,
    pathname,
    pinnedCommands,
    recentCommands,
    resolutions,
  ])

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
