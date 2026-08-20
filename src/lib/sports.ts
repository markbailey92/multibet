export type SportId = 'soccer' | 'basketball' | 'nfl'

export type MatchPhase = 'preMatch' | 'inPlay'

export type Competition = {
  id: string
  name: string
  /** External competition IDs from sheet (comma-separated in source). */
  externalIds?: string[]
}

export const MATCH_PHASES: { id: MatchPhase; name: string }[] = [
  { id: 'preMatch', name: 'Pre-Match' },
  { id: 'inPlay', name: 'In Play' },
]

export function allMatchPhases(): MatchPhase[] {
  return MATCH_PHASES.map((phase) => phase.id)
}

export type Sport = {
  id: SportId
  name: string
  externalId?: string
  competitions: Competition[]
}

export const FALLBACK_SPORTS: Sport[] = [
  {
    id: 'soccer',
    name: 'Soccer',
    competitions: [
      { id: 'epl', name: 'EPL' },
      { id: 'laliga', name: 'La Liga' },
      { id: 'seriea', name: 'Serie A' },
      { id: 'bundesliga', name: 'Bundesliga' },
      { id: 'ligue1', name: 'Ligue 1' },
    ],
  },
  {
    id: 'basketball',
    name: 'Basketball',
    competitions: [
      { id: 'nba', name: 'NBA' },
      { id: 'euroleague', name: 'EuroLeague' },
      { id: 'ncaab', name: 'NCAAB' },
    ],
  },
  {
    id: 'nfl',
    name: 'NFL',
    competitions: [
      { id: 'nfl', name: 'NFL' },
      { id: 'nfl-preseason', name: 'NFL Preseason' },
    ],
  },
]

/** @deprecated Use sheet-backed sports from SheetDataProvider when available. */
export const SPORTS = FALLBACK_SPORTS

export function getSportFromList(sports: Sport[], sportId: SportId): Sport {
  return sports.find((sport) => sport.id === sportId) ?? sports[0]
}

export function getSport(sportId: SportId): Sport {
  return getSportFromList(FALLBACK_SPORTS, sportId)
}

export function allCompetitionIdsFor(
  sports: Sport[],
  sportId: SportId,
): string[] {
  return getSportFromList(sports, sportId).competitions.map((c) => c.id)
}

export function allCompetitionIds(sportId: SportId): string[] {
  return allCompetitionIdsFor(FALLBACK_SPORTS, sportId)
}

export function formatCompetitionSummary(
  sportId: SportId,
  competitionIds: string[] | null | undefined,
  sports: Sport[] = FALLBACK_SPORTS,
): string {
  const sport = getSportFromList(sports, sportId)
  const ids = competitionIds ?? []
  if (ids.length === 0) return `${sport.name} · no competitions`
  if (ids.length === sport.competitions.length) {
    return `${sport.name} · All competitions`
  }
  const names = sport.competitions
    .filter((c) => ids.includes(c.id))
    .map((c) => c.name)
  return `${sport.name} · ${names.join(', ')}`
}
