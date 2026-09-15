import type { Leg } from '../types'
import { buildSeedTemplates, SEED_TEMPLATE_IDS } from './seedTemplates'
import {
  allCompetitionIds,
  type MatchPhase,
  type SportId,
} from './sports'

const SAVED_KEY = 'multibet.saved.templates.v1'
const SEED_MERGED_KEY = 'multibet.seed.templates.merged.v1'
const SEED_NAMES_KEY = 'multibet.seed.templates.names.v2'

export type SavedMultibet = {
  id: string
  name: string
  sportId: SportId
  competitionIds: string[]
  phases: MatchPhase[]
  savedAt: string
  updatedAt: string
  legs: Leg[]
}

function migratePhases(raw: unknown): MatchPhase[] {
  if (!Array.isArray(raw)) return ['preMatch']
  const phases = raw.filter(
    (phase): phase is MatchPhase => phase === 'preMatch' || phase === 'inPlay',
  )
  if (phases.length === 0) return ['preMatch']
  // Templates are single-phase only (pre-match XOR in-play).
  return [phases[0]]
}

function migrate(raw: unknown): SavedMultibet | null {
  if (!raw || typeof raw !== 'object') return null
  const item = raw as Partial<SavedMultibet> & { legs?: Leg[] }
  if (!item.id || !Array.isArray(item.legs)) return null
  const savedAt = item.savedAt ?? new Date().toISOString()
  const sportId: SportId =
    item.sportId === 'basketball' || item.sportId === 'nfl' || item.sportId === 'soccer'
      ? item.sportId
      : 'soccer'
  const competitionIds = Array.isArray(item.competitionIds)
    ? item.competitionIds.filter((id): id is string => typeof id === 'string')
    : allCompetitionIds(sportId)

  return {
    id: item.id,
    name: item.name?.trim() || defaultName(item.legs, savedAt),
    sportId,
    competitionIds,
    phases: migratePhases(item.phases),
    savedAt,
    updatedAt: item.updatedAt ?? savedAt,
    legs: item.legs,
  }
}

export function defaultName(legs: Leg[], when = new Date().toISOString()): string {
  if (legs.length === 0) return 'Untitled template'
  const first = legs[0]?.detail || legs[0]?.selection || 'Template'
  const stamp = new Date(when).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  return `${first} · ${legs.length} leg${legs.length === 1 ? '' : 's'} · ${stamp}`
}

export function readSavedTemplates(): SavedMultibet[] {
  try {
    const raw = localStorage.getItem(SAVED_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown[]
    return parsed
      .map(migrate)
      .filter((item): item is SavedMultibet => item != null)
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      )
  } catch {
    return []
  }
}

function writeSavedTemplates(items: SavedMultibet[]) {
  localStorage.setItem(SAVED_KEY, JSON.stringify(items))
}

/** Ensures the soccer seed pack is present (once per browser). Seeds are soccer-only and single-phase. */
export function ensureSeedTemplates(): SavedMultibet[] {
  try {
    if (localStorage.getItem(SEED_MERGED_KEY) !== '1') {
      const existing = readSavedTemplates()
      const existingIds = new Set(existing.map((item) => item.id))
      const missingSeeds = buildSeedTemplates().filter(
        (seed) => !existingIds.has(seed.id),
      )
      writeSavedTemplates([...missingSeeds, ...existing].slice(0, 80))
      localStorage.setItem(SEED_MERGED_KEY, '1')
    }
  } catch {
    /* ignore */
  }

  try {
    if (localStorage.getItem(SEED_NAMES_KEY) !== '1') {
      const nameById = new Map(
        buildSeedTemplates().map((seed) => [seed.id, seed.name]),
      )
      const items = readSavedTemplates().map((item) => {
        const nextName = nameById.get(item.id)
        return nextName && nextName !== item.name
          ? { ...item, name: nextName }
          : item
      })
      writeSavedTemplates(items)
      localStorage.setItem(SEED_NAMES_KEY, '1')
    }
  } catch {
    /* ignore */
  }

  return readSavedTemplates()
}

export function isSeedTemplateId(id: string): boolean {
  return SEED_TEMPLATE_IDS.has(id)
}

export function upsertSavedTemplate(
  input: {
    id?: string
    name?: string
    sportId: SportId
    competitionIds: string[]
    phases: MatchPhase[]
    legs: Leg[]
  },
): SavedMultibet {
  const now = new Date().toISOString()
  const existing = input.id
    ? readSavedTemplates().find((item) => item.id === input.id)
    : undefined

  const entry: SavedMultibet = {
    id: existing?.id ?? `mb-${Date.now()}`,
    name: (input.name?.trim() || existing?.name || defaultName(input.legs, now)).trim(),
    sportId: input.sportId,
    competitionIds: [...input.competitionIds],
    phases: input.phases.length === 1 ? [...input.phases] : [input.phases[0] ?? 'preMatch'],
    savedAt: existing?.savedAt ?? now,
    updatedAt: now,
    legs: structuredClone(input.legs),
  }

  const rest = readSavedTemplates().filter((item) => item.id !== entry.id)
  writeSavedTemplates([entry, ...rest].slice(0, 80))
  return entry
}

export function deleteSavedTemplate(id: string) {
  writeSavedTemplates(readSavedTemplates().filter((item) => item.id !== id))
}

export function renameSavedTemplate(id: string, name: string) {
  const trimmed = name.trim()
  if (!trimmed) return
  const items = readSavedTemplates().map((item) =>
    item.id === id
      ? { ...item, name: trimmed, updatedAt: new Date().toISOString() }
      : item,
  )
  writeSavedTemplates(items)
}
