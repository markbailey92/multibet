import type { Leg } from '../types'
import type { SavedMultibet } from './savedTemplates'
import { allCompetitionIds, type MatchPhase } from './sports'

type SeedDef = {
  id: string
  name: string
  phase: MatchPhase
  legs: Array<{
    marketTypeId: string
    marketName: string
    selection: string
  }>
}

function leg(
  marketTypeId: string,
  marketName: string,
  selection: string,
  index: number,
): Leg {
  return {
    id: `${marketTypeId}::${selection}::${index}`,
    scopeId: marketTypeId,
    marketTypeId,
    marketName,
    selection,
    detail: marketName,
  }
}

const SEED_DEFS: SeedDef[] = [
  {
    id: 'seed-pm-01',
    name: 'Home favourites',
    phase: 'preMatch',
    legs: [
      { marketTypeId: 'MatchResult', marketName: 'Match Result', selection: 'Home' },
      { marketTypeId: 'BothTeamsToScore', marketName: 'Both Teams To Score', selection: 'Yes' },
      { marketTypeId: 'TotalGoalsOverUnder', marketName: 'Total Goals Over/Under', selection: 'Over 2.5' },
    ],
  },
  {
    id: 'seed-pm-02',
    name: 'Away underdogs',
    phase: 'preMatch',
    legs: [
      { marketTypeId: 'MatchResult', marketName: 'Match Result', selection: 'Away' },
      { marketTypeId: 'TotalGoalsOverUnder', marketName: 'Total Goals Over/Under', selection: 'Under 2.5' },
      { marketTypeId: 'DoubleChance', marketName: 'Double Chance', selection: 'Draw or Away' },
    ],
  },
  {
    id: 'seed-pm-03',
    name: 'Draw specials',
    phase: 'preMatch',
    legs: [
      { marketTypeId: 'MatchResult', marketName: 'Match Result', selection: 'Draw' },
      { marketTypeId: 'BothTeamsToScore', marketName: 'Both Teams To Score', selection: 'Yes' },
      { marketTypeId: 'TotalGoalsOverUnder', marketName: 'Total Goals Over/Under', selection: 'Under 3.5' },
    ],
  },
  {
    id: 'seed-pm-04',
    name: 'Goals & BTTS',
    phase: 'preMatch',
    legs: [
      { marketTypeId: 'BothTeamsToScore', marketName: 'Both Teams To Score', selection: 'Yes' },
      { marketTypeId: 'TotalGoalsOverUnder', marketName: 'Total Goals Over/Under', selection: 'Over 2.5' },
      { marketTypeId: 'HomeTeamTotalGoalsOverUnder', marketName: 'Home Team Total Goals Over/Under', selection: 'Over 1.5' },
    ],
  },
  {
    id: 'seed-pm-05',
    name: 'Half-time stack',
    phase: 'preMatch',
    legs: [
      { marketTypeId: 'HalfTimeResult', marketName: 'Half Time Result', selection: 'Home' },
      { marketTypeId: 'HalfTimeBothTeamsToScore', marketName: 'Half Time Both Teams To Score', selection: 'Yes' },
      { marketTypeId: 'HalfTimeTotalGoalsOverUnder', marketName: 'Half Time Total Goals Over/Under', selection: 'Over 0.5' },
    ],
  },
  {
    id: 'seed-pm-06',
    name: 'Double chance cover',
    phase: 'preMatch',
    legs: [
      { marketTypeId: 'DoubleChance', marketName: 'Double Chance', selection: 'Home or Draw' },
      { marketTypeId: 'TotalGoalsOverUnder', marketName: 'Total Goals Over/Under', selection: 'Over 1.5' },
      { marketTypeId: 'OddOrEvenTotal', marketName: 'Odd Or Even Total', selection: 'Odd' },
    ],
  },
  {
    id: 'seed-pm-07',
    name: 'Correct score lean',
    phase: 'preMatch',
    legs: [
      { marketTypeId: 'CorrectScore', marketName: 'Correct Score', selection: 'Most Competitive' },
      { marketTypeId: 'BothTeamsToScore', marketName: 'Both Teams To Score', selection: 'Yes' },
      { marketTypeId: 'MatchResult', marketName: 'Match Result', selection: 'Home' },
    ],
  },
  {
    id: 'seed-pm-08',
    name: 'Team totals',
    phase: 'preMatch',
    legs: [
      { marketTypeId: 'HomeTeamTotalGoalsOverUnder', marketName: 'Home Team Total Goals Over/Under', selection: 'Over 1.5' },
      { marketTypeId: 'AwayTeamTotalGoalsOverUnder', marketName: 'Away Team Total Goals Over/Under', selection: 'Under 1.5' },
      { marketTypeId: 'MatchResult', marketName: 'Match Result', selection: 'Home' },
    ],
  },
  {
    id: 'seed-pm-09',
    name: 'Low-scoring EPL',
    phase: 'preMatch',
    legs: [
      { marketTypeId: 'TotalGoalsOverUnder', marketName: 'Total Goals Over/Under', selection: 'Under 2.5' },
      { marketTypeId: 'BothTeamsToScore', marketName: 'Both Teams To Score', selection: 'No' },
      { marketTypeId: 'DoubleChance', marketName: 'Double Chance', selection: 'Home or Draw' },
    ],
  },
  {
    id: 'seed-pm-10',
    name: 'High-scoring openers',
    phase: 'preMatch',
    legs: [
      { marketTypeId: 'TotalGoalsOverUnder', marketName: 'Total Goals Over/Under', selection: 'Over 3.5' },
      { marketTypeId: 'BothTeamsToScore', marketName: 'Both Teams To Score', selection: 'Yes' },
      { marketTypeId: 'HomeTeamTotalGoalsOverUnder', marketName: 'Home Team Total Goals Over/Under', selection: 'Over 1.5' },
      { marketTypeId: 'AwayTeamTotalGoalsOverUnder', marketName: 'Away Team Total Goals Over/Under', selection: 'Over 0.5' },
    ],
  },
  {
    id: 'seed-pm-11',
    name: 'Anytime scorer combo',
    phase: 'preMatch',
    legs: [
      { marketTypeId: 'AnytimeGoalscorer', marketName: 'Anytime Goalscorer', selection: 'Most Competitive' },
      { marketTypeId: 'MatchResult', marketName: 'Match Result', selection: 'Home' },
      { marketTypeId: 'TotalGoalsOverUnder', marketName: 'Total Goals Over/Under', selection: 'Over 2.5' },
    ],
  },
  {
    id: 'seed-pm-12',
    name: 'Second-half focus',
    phase: 'preMatch',
    legs: [
      { marketTypeId: 'SecondHalfTotalGoalsOverUnder', marketName: 'Second Half Total Goals Over/Under', selection: 'Over 1.5' },
      { marketTypeId: 'SecondHalfBothTeamsToScore', marketName: 'Second Half Both Teams To Score', selection: 'Yes' },
      { marketTypeId: 'MatchResult', marketName: 'Match Result', selection: 'Home' },
    ],
  },
  {
    id: 'seed-pm-13',
    name: 'Even totals',
    phase: 'preMatch',
    legs: [
      { marketTypeId: 'OddOrEvenTotal', marketName: 'Odd Or Even Total', selection: 'Even' },
      { marketTypeId: 'TotalGoalsOverUnder', marketName: 'Total Goals Over/Under', selection: 'Over 1.5' },
      { marketTypeId: 'BothTeamsToScore', marketName: 'Both Teams To Score', selection: 'Yes' },
    ],
  },
  {
    id: 'seed-pm-14',
    name: 'Away double',
    phase: 'preMatch',
    legs: [
      { marketTypeId: 'MatchResult', marketName: 'Match Result', selection: 'Away' },
      { marketTypeId: 'AwayTeamTotalGoalsOverUnder', marketName: 'Away Team Total Goals Over/Under', selection: 'Over 1.5' },
      { marketTypeId: 'BothTeamsToScore', marketName: 'Both Teams To Score', selection: 'Yes' },
      { marketTypeId: 'TotalGoalsOverUnder', marketName: 'Total Goals Over/Under', selection: 'Over 2.5' },
    ],
  },
  {
    id: 'seed-pm-15',
    name: 'Classic accumulator',
    phase: 'preMatch',
    legs: [
      { marketTypeId: 'MatchResult', marketName: 'Match Result', selection: 'Home' },
      { marketTypeId: 'HalfTimeResult', marketName: 'Half Time Result', selection: 'Home' },
      { marketTypeId: 'BothTeamsToScore', marketName: 'Both Teams To Score', selection: 'Yes' },
      { marketTypeId: 'TotalGoalsOverUnder', marketName: 'Total Goals Over/Under', selection: 'Over 2.5' },
      { marketTypeId: 'DoubleChance', marketName: 'Double Chance', selection: 'Home or Away' },
    ],
  },
  {
    id: 'seed-ip-01',
    name: 'Live home pressure',
    phase: 'inPlay',
    legs: [
      { marketTypeId: 'MatchResult', marketName: 'Match Result', selection: 'Home' },
      { marketTypeId: 'TotalGoalsOverUnder', marketName: 'Total Goals Over/Under', selection: 'Over 1.5' },
      { marketTypeId: 'BothTeamsToScore', marketName: 'Both Teams To Score', selection: 'Yes' },
    ],
  },
  {
    id: 'seed-ip-02',
    name: 'Next goal race',
    phase: 'inPlay',
    legs: [
      { marketTypeId: 'TotalGoalsOverUnder', marketName: 'Total Goals Over/Under', selection: 'Over 2.5' },
      { marketTypeId: 'HomeTeamTotalGoalsOverUnder', marketName: 'Home Team Total Goals Over/Under', selection: 'Over 0.5' },
      { marketTypeId: 'AwayTeamTotalGoalsOverUnder', marketName: 'Away Team Total Goals Over/Under', selection: 'Over 0.5' },
    ],
  },
  {
    id: 'seed-ip-03',
    name: 'Protect the lead',
    phase: 'inPlay',
    legs: [
      { marketTypeId: 'DoubleChance', marketName: 'Double Chance', selection: 'Home or Draw' },
      { marketTypeId: 'TotalGoalsOverUnder', marketName: 'Total Goals Over/Under', selection: 'Under 3.5' },
      { marketTypeId: 'BothTeamsToScore', marketName: 'Both Teams To Score', selection: 'No' },
    ],
  },
  {
    id: 'seed-ip-04',
    name: 'Comeback away',
    phase: 'inPlay',
    legs: [
      { marketTypeId: 'MatchResult', marketName: 'Match Result', selection: 'Away' },
      { marketTypeId: 'TotalGoalsOverUnder', marketName: 'Total Goals Over/Under', selection: 'Over 2.5' },
      { marketTypeId: 'BothTeamsToScore', marketName: 'Both Teams To Score', selection: 'Yes' },
    ],
  },
  {
    id: 'seed-ip-05',
    name: 'Half-time board',
    phase: 'inPlay',
    legs: [
      { marketTypeId: 'HalfTimeResult', marketName: 'Half Time Result', selection: 'Draw' },
      { marketTypeId: 'HalfTimeTotalGoalsOverUnder', marketName: 'Half Time Total Goals Over/Under', selection: 'Under 1.5' },
      { marketTypeId: 'HalfTimeBothTeamsToScore', marketName: 'Half Time Both Teams To Score', selection: 'No' },
    ],
  },
  {
    id: 'seed-ip-06',
    name: 'Second-half goals',
    phase: 'inPlay',
    legs: [
      { marketTypeId: 'SecondHalfTotalGoalsOverUnder', marketName: 'Second Half Total Goals Over/Under', selection: 'Over 0.5' },
      { marketTypeId: 'SecondHalfBothTeamsToScore', marketName: 'Second Half Both Teams To Score', selection: 'Yes' },
      { marketTypeId: 'MatchResult', marketName: 'Match Result', selection: 'Home' },
    ],
  },
  {
    id: 'seed-ip-07',
    name: 'Late goals',
    phase: 'inPlay',
    legs: [
      { marketTypeId: 'TotalGoalsOverUnder', marketName: 'Total Goals Over/Under', selection: 'Over 3.5' },
      { marketTypeId: 'BothTeamsToScore', marketName: 'Both Teams To Score', selection: 'Yes' },
      { marketTypeId: 'OddOrEvenTotal', marketName: 'Odd Or Even Total', selection: 'Odd' },
    ],
  },
  {
    id: 'seed-ip-08',
    name: 'Low tempo',
    phase: 'inPlay',
    legs: [
      { marketTypeId: 'TotalGoalsOverUnder', marketName: 'Total Goals Over/Under', selection: 'Under 2.5' },
      { marketTypeId: 'BothTeamsToScore', marketName: 'Both Teams To Score', selection: 'No' },
      { marketTypeId: 'DoubleChance', marketName: 'Double Chance', selection: 'Draw or Away' },
    ],
  },
  {
    id: 'seed-ip-09',
    name: 'Home or draw live',
    phase: 'inPlay',
    legs: [
      { marketTypeId: 'DoubleChance', marketName: 'Double Chance', selection: 'Home or Draw' },
      { marketTypeId: 'HomeTeamTotalGoalsOverUnder', marketName: 'Home Team Total Goals Over/Under', selection: 'Over 0.5' },
      { marketTypeId: 'TotalGoalsOverUnder', marketName: 'Total Goals Over/Under', selection: 'Over 1.5' },
    ],
  },
  {
    id: 'seed-ip-10',
    name: 'Correct score chase',
    phase: 'inPlay',
    legs: [
      { marketTypeId: 'CorrectScore', marketName: 'Correct Score', selection: 'Most Competitive' },
      { marketTypeId: 'MatchResult', marketName: 'Match Result', selection: 'Home' },
      { marketTypeId: 'TotalGoalsOverUnder', marketName: 'Total Goals Over/Under', selection: 'Over 2.5' },
    ],
  },
  {
    id: 'seed-ip-11',
    name: 'Away team totals',
    phase: 'inPlay',
    legs: [
      { marketTypeId: 'AwayTeamTotalGoalsOverUnder', marketName: 'Away Team Total Goals Over/Under', selection: 'Over 0.5' },
      { marketTypeId: 'MatchResult', marketName: 'Match Result', selection: 'Away' },
      { marketTypeId: 'BothTeamsToScore', marketName: 'Both Teams To Score', selection: 'Yes' },
    ],
  },
  {
    id: 'seed-ip-12',
    name: 'Even finish',
    phase: 'inPlay',
    legs: [
      { marketTypeId: 'OddOrEvenTotal', marketName: 'Odd Or Even Total', selection: 'Even' },
      { marketTypeId: 'TotalGoalsOverUnder', marketName: 'Total Goals Over/Under', selection: 'Under 3.5' },
      { marketTypeId: 'MatchResult', marketName: 'Match Result', selection: 'Draw' },
    ],
  },
  {
    id: 'seed-ip-13',
    name: 'Half-time home',
    phase: 'inPlay',
    legs: [
      { marketTypeId: 'HalfTimeResult', marketName: 'Half Time Result', selection: 'Home' },
      { marketTypeId: 'HalfTimeTotalGoalsOverUnder', marketName: 'Half Time Total Goals Over/Under', selection: 'Over 0.5' },
      { marketTypeId: 'HalfTimeHomeTeamTotalGoalsOverUnder', marketName: 'Half Time Home Team Total Goals Over/Under', selection: 'Over 0.5' },
    ],
  },
  {
    id: 'seed-ip-14',
    name: 'Second-half correct score',
    phase: 'inPlay',
    legs: [
      { marketTypeId: 'SecondHalfCorrectScore', marketName: 'Second Half Correct Score', selection: 'Most Competitive' },
      { marketTypeId: 'SecondHalfTotalGoalsOverUnder', marketName: 'Second Half Total Goals Over/Under', selection: 'Over 1.5' },
      { marketTypeId: 'MatchResult', marketName: 'Match Result', selection: 'Home' },
    ],
  },
  {
    id: 'seed-ip-15',
    name: 'Full live accumulator',
    phase: 'inPlay',
    legs: [
      { marketTypeId: 'MatchResult', marketName: 'Match Result', selection: 'Home' },
      { marketTypeId: 'BothTeamsToScore', marketName: 'Both Teams To Score', selection: 'Yes' },
      { marketTypeId: 'TotalGoalsOverUnder', marketName: 'Total Goals Over/Under', selection: 'Over 2.5' },
      { marketTypeId: 'DoubleChance', marketName: 'Double Chance', selection: 'Home or Away' },
      { marketTypeId: 'OddOrEvenTotal', marketName: 'Odd Or Even Total', selection: 'Odd' },
    ],
  },
]

const SEED_STAMP = '2026-03-15T12:00:00.000Z'

/** Varied soccer competition targets — cycled across the seed pack. */
const SOCCER_COMP_SETS: string[][] = [
  ['epl'],
  ['laliga'],
  ['seriea'],
  ['bundesliga'],
  ['ligue1'],
  ['epl', 'laliga'],
  ['epl', 'seriea'],
  ['laliga', 'seriea'],
  ['bundesliga', 'ligue1'],
  ['epl', 'bundesliga'],
  ['epl', 'laliga', 'seriea'],
  ['laliga', 'seriea', 'bundesliga'],
  ['epl', 'ligue1'],
  ['seriea', 'ligue1'],
  ['epl', 'laliga', 'bundesliga', 'ligue1'],
  ['epl', 'laliga', 'seriea', 'bundesliga', 'ligue1'],
  ['epl', 'seriea', 'ligue1'],
  ['laliga', 'bundesliga'],
  ['seriea', 'bundesliga', 'ligue1'],
  ['epl', 'laliga', 'ligue1'],
  ['bundesliga'],
  ['epl', 'seriea', 'bundesliga'],
  ['laliga', 'ligue1'],
  ['epl', 'bundesliga', 'ligue1'],
  ['seriea'],
  ['laliga', 'seriea', 'ligue1'],
  ['epl', 'laliga', 'seriea', 'bundesliga'],
  ['ligue1', 'bundesliga', 'seriea'],
  ['epl'],
  ['epl', 'laliga', 'seriea', 'bundesliga', 'ligue1'],
]

export function buildSeedTemplates(): SavedMultibet[] {
  const allSoccer = allCompetitionIds('soccer')
  return SEED_DEFS.map((def, index) => {
    const savedAt = new Date(
      Date.parse(SEED_STAMP) + index * 60_000,
    ).toISOString()
    const competitionIds = SOCCER_COMP_SETS[index] ?? allSoccer
    return {
      id: def.id,
      name: def.name,
      sportId: 'soccer' as const,
      competitionIds: [...competitionIds],
      phases: [def.phase],
      savedAt,
      updatedAt: savedAt,
      legs: def.legs.map((entry, legIndex) =>
        leg(entry.marketTypeId, entry.marketName, entry.selection, legIndex),
      ),
    }
  })
}

export const SEED_TEMPLATE_IDS = new Set(SEED_DEFS.map((def) => def.id))
