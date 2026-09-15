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
    name: 'Pre-Match · Home favourites',
    phase: 'preMatch',
    legs: [
      { marketTypeId: 'MatchResult', marketName: 'Match Result', selection: 'Home' },
      { marketTypeId: 'BothTeamsToScore', marketName: 'Both Teams To Score', selection: 'Yes' },
      { marketTypeId: 'TotalGoalsOverUnder', marketName: 'Total Goals Over/Under', selection: 'Over 2.5' },
    ],
  },
  {
    id: 'seed-pm-02',
    name: 'Pre-Match · Away underdogs',
    phase: 'preMatch',
    legs: [
      { marketTypeId: 'MatchResult', marketName: 'Match Result', selection: 'Away' },
      { marketTypeId: 'TotalGoalsOverUnder', marketName: 'Total Goals Over/Under', selection: 'Under 2.5' },
      { marketTypeId: 'DoubleChance', marketName: 'Double Chance', selection: 'Draw or Away' },
    ],
  },
  {
    id: 'seed-pm-03',
    name: 'Pre-Match · Draw specials',
    phase: 'preMatch',
    legs: [
      { marketTypeId: 'MatchResult', marketName: 'Match Result', selection: 'Draw' },
      { marketTypeId: 'BothTeamsToScore', marketName: 'Both Teams To Score', selection: 'Yes' },
      { marketTypeId: 'TotalGoalsOverUnder', marketName: 'Total Goals Over/Under', selection: 'Under 3.5' },
    ],
  },
  {
    id: 'seed-pm-04',
    name: 'Pre-Match · Goals & BTTS',
    phase: 'preMatch',
    legs: [
      { marketTypeId: 'BothTeamsToScore', marketName: 'Both Teams To Score', selection: 'Yes' },
      { marketTypeId: 'TotalGoalsOverUnder', marketName: 'Total Goals Over/Under', selection: 'Over 2.5' },
      { marketTypeId: 'HomeTeamTotalGoalsOverUnder', marketName: 'Home Team Total Goals Over/Under', selection: 'Over 1.5' },
    ],
  },
  {
    id: 'seed-pm-05',
    name: 'Pre-Match · Half-time stack',
    phase: 'preMatch',
    legs: [
      { marketTypeId: 'HalfTimeResult', marketName: 'Half Time Result', selection: 'Home' },
      { marketTypeId: 'HalfTimeBothTeamsToScore', marketName: 'Half Time Both Teams To Score', selection: 'Yes' },
      { marketTypeId: 'HalfTimeTotalGoalsOverUnder', marketName: 'Half Time Total Goals Over/Under', selection: 'Over 0.5' },
    ],
  },
  {
    id: 'seed-pm-06',
    name: 'Pre-Match · Double chance cover',
    phase: 'preMatch',
    legs: [
      { marketTypeId: 'DoubleChance', marketName: 'Double Chance', selection: 'Home or Draw' },
      { marketTypeId: 'TotalGoalsOverUnder', marketName: 'Total Goals Over/Under', selection: 'Over 1.5' },
      { marketTypeId: 'OddOrEvenTotal', marketName: 'Odd Or Even Total', selection: 'Odd' },
    ],
  },
  {
    id: 'seed-pm-07',
    name: 'Pre-Match · Correct score lean',
    phase: 'preMatch',
    legs: [
      { marketTypeId: 'CorrectScore', marketName: 'Correct Score', selection: 'Most Competitive' },
      { marketTypeId: 'BothTeamsToScore', marketName: 'Both Teams To Score', selection: 'Yes' },
      { marketTypeId: 'MatchResult', marketName: 'Match Result', selection: 'Home' },
    ],
  },
  {
    id: 'seed-pm-08',
    name: 'Pre-Match · Team totals',
    phase: 'preMatch',
    legs: [
      { marketTypeId: 'HomeTeamTotalGoalsOverUnder', marketName: 'Home Team Total Goals Over/Under', selection: 'Over 1.5' },
      { marketTypeId: 'AwayTeamTotalGoalsOverUnder', marketName: 'Away Team Total Goals Over/Under', selection: 'Under 1.5' },
      { marketTypeId: 'MatchResult', marketName: 'Match Result', selection: 'Home' },
    ],
  },
  {
    id: 'seed-pm-09',
    name: 'Pre-Match · Low-scoring EPL',
    phase: 'preMatch',
    legs: [
      { marketTypeId: 'TotalGoalsOverUnder', marketName: 'Total Goals Over/Under', selection: 'Under 2.5' },
      { marketTypeId: 'BothTeamsToScore', marketName: 'Both Teams To Score', selection: 'No' },
      { marketTypeId: 'DoubleChance', marketName: 'Double Chance', selection: 'Home or Draw' },
    ],
  },
  {
    id: 'seed-pm-10',
    name: 'Pre-Match · High-scoring openers',
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
    name: 'Pre-Match · Anytime scorer combo',
    phase: 'preMatch',
    legs: [
      { marketTypeId: 'AnytimeGoalscorer', marketName: 'Anytime Goalscorer', selection: 'Most Competitive' },
      { marketTypeId: 'MatchResult', marketName: 'Match Result', selection: 'Home' },
      { marketTypeId: 'TotalGoalsOverUnder', marketName: 'Total Goals Over/Under', selection: 'Over 2.5' },
    ],
  },
  {
    id: 'seed-pm-12',
    name: 'Pre-Match · Second-half focus',
    phase: 'preMatch',
    legs: [
      { marketTypeId: 'SecondHalfTotalGoalsOverUnder', marketName: 'Second Half Total Goals Over/Under', selection: 'Over 1.5' },
      { marketTypeId: 'SecondHalfBothTeamsToScore', marketName: 'Second Half Both Teams To Score', selection: 'Yes' },
      { marketTypeId: 'MatchResult', marketName: 'Match Result', selection: 'Home' },
    ],
  },
  {
    id: 'seed-pm-13',
    name: 'Pre-Match · Even totals',
    phase: 'preMatch',
    legs: [
      { marketTypeId: 'OddOrEvenTotal', marketName: 'Odd Or Even Total', selection: 'Even' },
      { marketTypeId: 'TotalGoalsOverUnder', marketName: 'Total Goals Over/Under', selection: 'Over 1.5' },
      { marketTypeId: 'BothTeamsToScore', marketName: 'Both Teams To Score', selection: 'Yes' },
    ],
  },
  {
    id: 'seed-pm-14',
    name: 'Pre-Match · Away double',
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
    name: 'Pre-Match · Classic accumulator',
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
    name: 'In-Play · Live home pressure',
    phase: 'inPlay',
    legs: [
      { marketTypeId: 'MatchResult', marketName: 'Match Result', selection: 'Home' },
      { marketTypeId: 'TotalGoalsOverUnder', marketName: 'Total Goals Over/Under', selection: 'Over 1.5' },
      { marketTypeId: 'BothTeamsToScore', marketName: 'Both Teams To Score', selection: 'Yes' },
    ],
  },
  {
    id: 'seed-ip-02',
    name: 'In-Play · Next goal race',
    phase: 'inPlay',
    legs: [
      { marketTypeId: 'TotalGoalsOverUnder', marketName: 'Total Goals Over/Under', selection: 'Over 2.5' },
      { marketTypeId: 'HomeTeamTotalGoalsOverUnder', marketName: 'Home Team Total Goals Over/Under', selection: 'Over 0.5' },
      { marketTypeId: 'AwayTeamTotalGoalsOverUnder', marketName: 'Away Team Total Goals Over/Under', selection: 'Over 0.5' },
    ],
  },
  {
    id: 'seed-ip-03',
    name: 'In-Play · Protect the lead',
    phase: 'inPlay',
    legs: [
      { marketTypeId: 'DoubleChance', marketName: 'Double Chance', selection: 'Home or Draw' },
      { marketTypeId: 'TotalGoalsOverUnder', marketName: 'Total Goals Over/Under', selection: 'Under 3.5' },
      { marketTypeId: 'BothTeamsToScore', marketName: 'Both Teams To Score', selection: 'No' },
    ],
  },
  {
    id: 'seed-ip-04',
    name: 'In-Play · Comeback away',
    phase: 'inPlay',
    legs: [
      { marketTypeId: 'MatchResult', marketName: 'Match Result', selection: 'Away' },
      { marketTypeId: 'TotalGoalsOverUnder', marketName: 'Total Goals Over/Under', selection: 'Over 2.5' },
      { marketTypeId: 'BothTeamsToScore', marketName: 'Both Teams To Score', selection: 'Yes' },
    ],
  },
  {
    id: 'seed-ip-05',
    name: 'In-Play · Half-time board',
    phase: 'inPlay',
    legs: [
      { marketTypeId: 'HalfTimeResult', marketName: 'Half Time Result', selection: 'Draw' },
      { marketTypeId: 'HalfTimeTotalGoalsOverUnder', marketName: 'Half Time Total Goals Over/Under', selection: 'Under 1.5' },
      { marketTypeId: 'HalfTimeBothTeamsToScore', marketName: 'Half Time Both Teams To Score', selection: 'No' },
    ],
  },
  {
    id: 'seed-ip-06',
    name: 'In-Play · Second-half goals',
    phase: 'inPlay',
    legs: [
      { marketTypeId: 'SecondHalfTotalGoalsOverUnder', marketName: 'Second Half Total Goals Over/Under', selection: 'Over 0.5' },
      { marketTypeId: 'SecondHalfBothTeamsToScore', marketName: 'Second Half Both Teams To Score', selection: 'Yes' },
      { marketTypeId: 'MatchResult', marketName: 'Match Result', selection: 'Home' },
    ],
  },
  {
    id: 'seed-ip-07',
    name: 'In-Play · Late goals',
    phase: 'inPlay',
    legs: [
      { marketTypeId: 'TotalGoalsOverUnder', marketName: 'Total Goals Over/Under', selection: 'Over 3.5' },
      { marketTypeId: 'BothTeamsToScore', marketName: 'Both Teams To Score', selection: 'Yes' },
      { marketTypeId: 'OddOrEvenTotal', marketName: 'Odd Or Even Total', selection: 'Odd' },
    ],
  },
  {
    id: 'seed-ip-08',
    name: 'In-Play · Low tempo',
    phase: 'inPlay',
    legs: [
      { marketTypeId: 'TotalGoalsOverUnder', marketName: 'Total Goals Over/Under', selection: 'Under 2.5' },
      { marketTypeId: 'BothTeamsToScore', marketName: 'Both Teams To Score', selection: 'No' },
      { marketTypeId: 'DoubleChance', marketName: 'Double Chance', selection: 'Draw or Away' },
    ],
  },
  {
    id: 'seed-ip-09',
    name: 'In-Play · Home or draw live',
    phase: 'inPlay',
    legs: [
      { marketTypeId: 'DoubleChance', marketName: 'Double Chance', selection: 'Home or Draw' },
      { marketTypeId: 'HomeTeamTotalGoalsOverUnder', marketName: 'Home Team Total Goals Over/Under', selection: 'Over 0.5' },
      { marketTypeId: 'TotalGoalsOverUnder', marketName: 'Total Goals Over/Under', selection: 'Over 1.5' },
    ],
  },
  {
    id: 'seed-ip-10',
    name: 'In-Play · Correct score chase',
    phase: 'inPlay',
    legs: [
      { marketTypeId: 'CorrectScore', marketName: 'Correct Score', selection: 'Most Competitive' },
      { marketTypeId: 'MatchResult', marketName: 'Match Result', selection: 'Home' },
      { marketTypeId: 'TotalGoalsOverUnder', marketName: 'Total Goals Over/Under', selection: 'Over 2.5' },
    ],
  },
  {
    id: 'seed-ip-11',
    name: 'In-Play · Away team totals',
    phase: 'inPlay',
    legs: [
      { marketTypeId: 'AwayTeamTotalGoalsOverUnder', marketName: 'Away Team Total Goals Over/Under', selection: 'Over 0.5' },
      { marketTypeId: 'MatchResult', marketName: 'Match Result', selection: 'Away' },
      { marketTypeId: 'BothTeamsToScore', marketName: 'Both Teams To Score', selection: 'Yes' },
    ],
  },
  {
    id: 'seed-ip-12',
    name: 'In-Play · Even finish',
    phase: 'inPlay',
    legs: [
      { marketTypeId: 'OddOrEvenTotal', marketName: 'Odd Or Even Total', selection: 'Even' },
      { marketTypeId: 'TotalGoalsOverUnder', marketName: 'Total Goals Over/Under', selection: 'Under 3.5' },
      { marketTypeId: 'MatchResult', marketName: 'Match Result', selection: 'Draw' },
    ],
  },
  {
    id: 'seed-ip-13',
    name: 'In-Play · Half-time home',
    phase: 'inPlay',
    legs: [
      { marketTypeId: 'HalfTimeResult', marketName: 'Half Time Result', selection: 'Home' },
      { marketTypeId: 'HalfTimeTotalGoalsOverUnder', marketName: 'Half Time Total Goals Over/Under', selection: 'Over 0.5' },
      { marketTypeId: 'HalfTimeHomeTeamTotalGoalsOverUnder', marketName: 'Half Time Home Team Total Goals Over/Under', selection: 'Over 0.5' },
    ],
  },
  {
    id: 'seed-ip-14',
    name: 'In-Play · Second-half correct score',
    phase: 'inPlay',
    legs: [
      { marketTypeId: 'SecondHalfCorrectScore', marketName: 'Second Half Correct Score', selection: 'Most Competitive' },
      { marketTypeId: 'SecondHalfTotalGoalsOverUnder', marketName: 'Second Half Total Goals Over/Under', selection: 'Over 1.5' },
      { marketTypeId: 'MatchResult', marketName: 'Match Result', selection: 'Home' },
    ],
  },
  {
    id: 'seed-ip-15',
    name: 'In-Play · Full live accumulator',
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

export function buildSeedTemplates(): SavedMultibet[] {
  const competitionIds = allCompetitionIds('soccer')
  return SEED_DEFS.map((def, index) => {
    const savedAt = new Date(
      Date.parse(SEED_STAMP) + index * 60_000,
    ).toISOString()
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
