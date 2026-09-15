/** Map MultiBet competition ids / names to badge assets in /public/competitions. */
const BADGE_BY_ID: Record<string, string> = {
  epl: '/competitions/premier-league.svg',
  'premier-league': '/competitions/premier-league.svg',
  laliga: '/competitions/la-liga.svg',
  'la-liga': '/competitions/la-liga.svg',
  seriea: '/competitions/serie-a.svg',
  'serie-a': '/competitions/serie-a.svg',
  bundesliga: '/competitions/bundesliga.svg',
  ligue1: '/competitions/ligue-1.svg',
  'ligue-1': '/competitions/ligue-1.svg',
}

const BADGE_BY_NAME: Record<string, string> = {
  epl: '/competitions/premier-league.svg',
  'premier league': '/competitions/premier-league.svg',
  'english premier league': '/competitions/premier-league.svg',
  'la liga': '/competitions/la-liga.svg',
  laliga: '/competitions/la-liga.svg',
  'serie a': '/competitions/serie-a.svg',
  seriea: '/competitions/serie-a.svg',
  bundesliga: '/competitions/bundesliga.svg',
  'ligue 1': '/competitions/ligue-1.svg',
  ligue1: '/competitions/ligue-1.svg',
}

export function competitionBadgeUrl(
  competitionId: string,
  competitionName?: string,
): string | null {
  const byId = BADGE_BY_ID[competitionId.toLowerCase()]
  if (byId) return byId
  if (competitionName) {
    const byName = BADGE_BY_NAME[competitionName.trim().toLowerCase()]
    if (byName) return byName
  }
  return null
}

export function competitionFallbackLabel(name: string): string {
  const cleaned = name.trim()
  if (!cleaned) return '?'
  const parts = cleaned.split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}
