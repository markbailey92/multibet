import type { Market, MarketSelection, MarketTemplate, TemplateCode } from '../types'

const TEMPLATE_CODES = new Set<TemplateCode>([
  'MC12',
  'MC123',
  'MC12345',
  'MC1212345',
  'MC12312345',
])

/** Markets hidden from the catalog regardless of sheet contents. */
export const EXCLUDED_MARKET_IDS = new Set(['NextGoalscorer'])

const INFER_CODE: Record<string, TemplateCode> = {
  LastTeamToScore: 'MC123',
  PlayerTotalAssists: 'MC1212345',
  PlayerTotalShots: 'MC1212345',
  PlayerTotalShotsOnGoal: 'MC1212345',
}

type SheetRow = Record<string, string>

function cleanLabel(value: string): string {
  return value
    .replace(/\{Player 1 Fullname\}/gi, 'Player')
    .replace(/\{Player 2 Fullname\}…?/gi, 'Player')
    .replace(/\{Player[^}]*\}/gi, 'Player')
    .replace(/Home Team Name/gi, 'Home')
    .replace(/Away Team Name/gi, 'Away')
    .replace(/…/g, '')
    .trim()
}

function splitLines(value: string): string[] {
  return value
    .split(/\n+/)
    .map((part) => part.trim())
    .filter((part) => part && part !== '…' && part !== '...')
}

function optionsFromNames(names: string[], count: number): string[] {
  const cleaned: string[] = []
  const seen = new Set<string>()
  for (const name of names) {
    const label = cleanLabel(name)
    if (!label || seen.has(label)) continue
    seen.add(label)
    cleaned.push(label)
  }
  while (cleaned.length < count) {
    cleaned.push(`Option ${cleaned.length + 1}`)
  }
  return cleaned.slice(0, count)
}

function sideLabels(name: string, selectionIds: string[]): [string, string] {
  const ids = selectionIds.join(' ').toLowerCase()
  const lower = name.toLowerCase()
  if (
    ids.includes('over') ||
    ids.includes('under') ||
    lower.includes('over/under') ||
    lower.includes('over under')
  ) {
    return ['Over', 'Under']
  }
  if (lower.includes('handicap')) return ['Home', 'Away']
  return ['Home', 'Away']
}

function exactScoresHome(): string[] {
  return ['1-0', '2-0', '2-1', '3-0', '3-1', '3-2', '4-0', '4-1', '4-2', '5-0']
}

function exactScoresDraw(): string[] {
  return ['0-0', '1-1', '2-2', '3-3', '4-4', '5-5', '6-6']
}

function exactScoresAway(): string[] {
  return ['0-1', '0-2', '1-2', '0-3', '1-3', '2-3', '0-4', '1-4', '2-4', '0-5']
}

function halfLines(count: number): string[] {
  return Array.from({ length: count }, (_, i) => `${i + 0.5}`)
}

function buildTemplate(
  code: TemplateCode,
  name: string,
  selectionIds: string[],
  selectionNames: string[],
): MarketTemplate {
  if (code === 'MC12') {
    let options = optionsFromNames(selectionNames, 2)
    const playerish =
      selectionIds.some((id) => id.toLowerCase().includes('playerid')) ||
      /player/i.test(name)
    if (playerish && (options[0] === 'Player' || options[0].startsWith('{'))) {
      options = selectionIds.some((id) => /_Home_|Home_/i.test(id))
        ? ['Home', 'Away']
        : ['Yes', 'No']
    }
    return { code, options }
  }

  if (code === 'MC123') {
    let options = optionsFromNames(selectionNames, 3)
    if (options[0] === 'Player' || selectionNames[0]?.includes('{')) {
      options = ['Home', 'Draw', 'Away']
    }
    return { code, options }
  }

  if (code === 'MC12345') {
    const lower = name.toLowerCase()
    const max = lower.includes('goal') && !lower.includes('card') ? 10 : 15
    return {
      code,
      numbers: Array.from({ length: max + 1 }, (_, i) => String(i)),
    }
  }

  if (code === 'MC1212345') {
    const [side1, side2] = sideLabels(name, selectionIds)
    const lower = name.toLowerCase()
    let lines: string[]
    if (lower.includes('corner')) lines = halfLines(12)
    else if (lower.includes('booking') || lower.includes('card')) lines = halfLines(10)
    else if (lower.includes('shot')) lines = halfLines(16)
    else if (lower.includes('assist')) lines = halfLines(8)
    else lines = halfLines(8)
    return { code, side1, side2, lines, lineColumns: 2 }
  }

  return {
    code: 'MC12312345',
    homeScores: exactScoresHome(),
    drawScores: exactScoresDraw(),
    awayScores: exactScoresAway(),
    variants: ['grid', 'stepper'],
  }
}

function field(row: SheetRow, ...candidates: string[]): string {
  for (const key of candidates) {
    if (key in row && row[key] != null) return String(row[key])
  }
  const keys = Object.keys(row)
  for (const candidate of candidates) {
    const found = keys.find((key) =>
      key.toLowerCase().includes(candidate.toLowerCase()),
    )
    if (found) return String(row[found] ?? '')
  }
  return ''
}

function parseCode(raw: string): TemplateCode | null {
  const code = raw.trim().toUpperCase()
  return TEMPLATE_CODES.has(code as TemplateCode)
    ? (code as TemplateCode)
    : null
}

function parseFlag(raw: string): boolean {
  const value = raw.trim().toLowerCase()
  return value === 'y' || value === 'yes' || value === 'true' || value === '1'
}

function buildSelections(
  selectionIds: string[],
  selectionNames: string[],
): MarketSelection[] {
  const selections: MarketSelection[] = []
  const count = Math.max(selectionIds.length, selectionNames.length)

  for (let index = 0; index < count; index += 1) {
    const id = selectionIds[index]?.trim()
    if (!id) continue
    selections.push({
      id,
      label: cleanLabel(selectionNames[index] ?? ''),
    })
  }

  return selections
}

export function rowsToMarkets(rows: SheetRow[]): Market[] {
  const markets: Market[] = []

  for (const row of rows) {
    const id = field(row, 'Multibet Market Type Id').trim()
    if (!id || EXCLUDED_MARKET_IDS.has(id)) continue

    const name = field(row, 'Multibet Market Type Name').trim()
    const description = field(row, 'Description').trim()
    const sheetCode = parseCode(field(row, 'code'))
    const code =
      sheetCode ?? INFER_CODE[id] ?? ('MC12' as TemplateCode)
    const categories = field(row, 'categories')
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean)
    const selectionIds = splitLines(field(row, 'Multibet Selection Ids'))
    const selectionNames = splitLines(
      field(row, 'Multibet Selection Names', 'Selection Names'),
    )

    markets.push({
      id,
      order: Number(field(row, 'order')) || 0,
      sbmId: field(row, 'SBM MT Id').trim(),
      name,
      description,
      categories,
      selections: buildSelections(selectionIds, selectionNames),
      preMatch: parseFlag(field(row, 'PreMatch')),
      inPlay: parseFlag(field(row, 'InPlay')),
      code,
      codeSource: sheetCode ? 'sheet' : 'inferred',
      template: buildTemplate(code, name, selectionIds, selectionNames),
    })
  }

  return markets.sort((a, b) => a.order - b.order)
}
